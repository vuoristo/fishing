#!/usr/bin/env python3
"""Refresh the real Keitele depth chart, sampled contours, and OSM outline.

Uses the public SYKE WMS GetMap/GetFeatureInfo interface. WFS on the same
service is disabled. Survey contours retain the provider's original metre
values; the downloader never manufactures depths or weakens TLS validation.
"""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request
import urllib.error
import time
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'public/data'
SOURCE = 'https://paikkatiedot.ymparisto.fi/geoserver/wms'
CONTOUR_LAYER = 'mert:syvyyskayra_vLine'
CHART_LAYERS = 'mert:syvyysalue_aPolygon,mert:syvyyskayra_vLine,mert:syvyyspiste_pPoint'
SAMPLE_BBOX = [25.85, 62.81, 26.03, 62.91]
CHART_BBOX = [25.53, 62.56, 26.46, 63.21]
HEADERS = {'User-Agent': 'KeiteleFishingPrototype/0.1 (public lake data research)', 'Accept': '*/*'}


def request(url, params=None):
    if params:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 502, 503, 504) or attempt == 2:
                raise
            delay = [2, 5][attempt]
            print(f'Transient HTTP {exc.code} from {urllib.parse.urlsplit(url).hostname}; retrying after {delay}s.', flush=True)
            time.sleep(delay)


def compact(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()


def main():
    ns = {'w': 'http://www.opengis.net/wms'}
    print('Checking the SYKE contour service…', flush=True)
    caps = ET.fromstring(request(SOURCE, {'service': 'WMS', 'version': '1.3.0', 'request': 'GetCapabilities'}))
    layers = {l.findtext('w:Name', namespaces=ns): l for l in caps.findall('.//w:Layer', ns)}
    if CONTOUR_LAYER not in layers or layers[CONTOUR_LAYER].get('queryable') != '1':
        raise ValueError('The official contour layer is missing or not queryable; no files were changed.')
    params = {
        'service': 'WMS', 'version': '1.1.1', 'srs': 'EPSG:4326',
        'bbox': ','.join(map(str, SAMPLE_BBOX)), 'width': 1024, 'height': 1024,
        'styles': '', 'format': 'image/png', 'transparent': 'true',
        'layers': CONTOUR_LAYER, 'query_layers': CONTOUR_LAYER,
        'request': 'GetFeatureInfo', 'info_format': 'application/json',
        'buffer': 512, 'FI_LINE_TOLERANCE': 512, 'feature_count': 10000,
    }
    queries = [(x, y) for x in [100, 300, 512, 720, 924] for y in [100, 300, 512, 720, 924]]

    def sample(q):
        result = json.loads(request(SOURCE, {**params, 'x': q[0], 'y': q[1]}))
        if result.get('type') != 'FeatureCollection':
            raise ValueError('GetFeatureInfo did not return GeoJSON.')
        return result.get('features', [])

    print('Sampling 25 map locations for complete contour features…', flush=True)
    unique = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(sample, queries):
            for feature in result:
                if feature.get('geometry', {}).get('type') not in ('LineString', 'MultiLineString'):
                    continue
                depth = feature.get('properties', {}).get('DEPTH')
                if not isinstance(depth, (int, float)) or not 0 < depth < 100:
                    raise ValueError('A contour has no valid metre-valued DEPTH property; no files were changed.')
                unique[feature['id']] = feature
    if len(unique) < 3:
        raise ValueError('Insufficient survey coverage returned; no files were changed.')
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    depth_metadata = {
        'source': 'Finnish Environment Institute (SYKE) WMS / National Land Survey of Finland topographic depth data',
        'source_url': SOURCE, 'layer': CONTOUR_LAYER, 'bbox': SAMPLE_BBOX,
        'downloaded_at': timestamp,
        'attribution': 'Depth data: SYKE / National Land Survey of Finland.',
        'license_reference': 'https://www.maanmittauslaitos.fi/en/opendata-licence-cc40',
        'service_access_constraints': caps.findtext('w:Service/w:AccessConstraints', namespaces=ns),
        'coverage': 'Unique complete contour features from 25 GetFeatureInfo sample locations. A sampled subset, not a complete lake survey. Game depths are interpolated estimates, not for navigation.',
    }
    contours = {'type': 'FeatureCollection', 'features': list(unique.values()), 'metadata': depth_metadata}
    print(f'Retrieved {len(unique)} unique contours. Downloading the full-lake chart…', flush=True)
    chart = request(SOURCE, {
        'service': 'WMS', 'version': '1.1.1', 'srs': 'EPSG:4326',
        'bbox': ','.join(map(str, CHART_BBOX)), 'width': 1100, 'height': 1700,
        'styles': '', 'format': 'image/png', 'transparent': 'true',
        'layers': CHART_LAYERS, 'request': 'GetMap',
    })
    if chart[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('The official map request did not return a PNG; no files were changed.')
    print('Downloading the OpenStreetMap lake outline…', flush=True)
    query = '[out:json][timeout:30];relation["name"="Keitele"]["type"="multipolygon"];out geom;'
    osm = json.loads(request('https://overpass-api.de/api/interpreter', {'data': query}))
    relation = next(e for e in osm['elements'] if e.get('id') == 444652)
    inners, outers, segments = [], [], []
    for member in relation['members']:
        if 'geometry' not in member:
            raise ValueError('OSM relation is incomplete; no files were changed.')
        coords = [[p['lon'], p['lat']] for p in member['geometry']]
        if member['role'] == 'inner':
            if coords[0] != coords[-1]:
                raise ValueError('OSM island ring is not closed; no files were changed.')
            inners.append(coords)
        elif member['role'] == 'outer':
            segments.append(coords)
    while segments:
        ring = segments.pop(0)
        while ring[-1] != ring[0]:
            found = False
            for j, segment in enumerate(segments):
                if segment[0] == ring[-1]:
                    ring += segment[1:]
                elif segment[-1] == ring[-1]:
                    ring += list(reversed(segment))[1:]
                else:
                    continue
                segments.pop(j)
                found = True
                break
            if not found:
                raise ValueError('OSM outer ring is not complete; no files were changed.')
        outers.append(ring)
    shore_metadata = {
        'source': 'OpenStreetMap contributors', 'url': 'https://www.openstreetmap.org/relation/444652',
        'license': 'ODbL 1.0', 'downloaded_at': timestamp, 'attribution': '© OpenStreetMap contributors',
    }
    shoreline = {'type': 'FeatureCollection', 'features': [
        {'type': 'Feature', 'properties': {'name': 'Keitele', 'osm_relation': 444652, 'role': 'outer'},
         'geometry': {'type': 'Polygon', 'coordinates': [ring]}} for ring in outers
    ] + [
        {'type': 'Feature', 'properties': {'role': 'island'}, 'geometry': {'type': 'Polygon', 'coordinates': [ring]}} for ring in inners
    ], 'metadata': shore_metadata}
    outputs = {'keitele-depth.geojson': compact(contours), 'keitele-depth-chart.png': chart, 'keitele-shoreline.geojson': compact(shoreline)}
    manifest = {'depth': depth_metadata, 'shoreline': shore_metadata,
                'chart': {'source_url': SOURCE, 'layers': CHART_LAYERS, 'bbox': CHART_BBOX, 'width': 1100, 'height': 1700},
                'sha256': {name: hashlib.sha256(content).hexdigest() for name, content in outputs.items()}}
    ROOT.mkdir(parents=True, exist_ok=True)
    for name, content in outputs.items():
        path = ROOT / name
        tmp = ROOT / (name + '.tmp')
        tmp.write_bytes(content)
        tmp.replace(path)
    (ROOT / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Downloaded {len(unique)} real contour features, the official full-lake chart, and {len(inners)} OSM islands.')
    print('Source geometries and metre values preserved. Game interpolation is not a navigation chart.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        import sys
        print(f'Data refresh failed: {exc}\nNo synthetic depths were generated. Existing bundled files remain usable.', file=sys.stderr)
        sys.exit(1)
