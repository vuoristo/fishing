const paths:Record<string,string>={
 fish:'<path d="M3 12s4-6 10-4l4-4v16l-4-4C7 18 3 12 3 12Z"/><path d="M8 8l1-3 4 3M8 16l1 3 4-3"/><circle cx="6.5" cy="11" r=".8" fill="currentColor" stroke="none"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
 boat:'<path d="M3 12h18l-3 6H7Z"/><path d="M8 12V6h7l3 6M3 21c2 1 3-1 5 0s3-1 5 0 3-1 5 0 3-1 5 0"/>',
 waves:'<path d="M2 7c3-4 5 4 8 0s5 4 8 0 3 0 4 0M2 12c3-4 5 4 8 0s5 4 8 0 3 0 4 0M2 17c3-4 5 4 8 0s5 4 8 0 3 0 4 0"/>',
 settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--paper)"/><circle cx="15" cy="12" r="2" fill="var(--paper)"/><circle cx="8" cy="18" r="2" fill="var(--paper)"/>',
 arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
 anchor:'<path d="M12 6v15M8 10h8M3 15c0 8 18 8 18 0M1 17l2-3 3 2M18 16l3-2 2 3"/><circle cx="12" cy="4" r="2"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
 wind:'<path d="M3 7h13c5 0 5-5 1-5M3 12h17c5 0 5 5 1 5M3 17h9c5 0 5 5 1 5"/>',
 chevron:'<path d="m8 5 7 7-7 7"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
 book:'<path d="M12 6c-3-3-7-3-10-2v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
 map:'<path d="m2 5 6-3 8 3 6-3v17l-6 3-8-3-6 3Zm6-3v17m8-14v17"/>',
 volume:'<path d="m3 9 4 0 5-5v16l-5-5H3Zm13-2c5 3 5 7 0 10m1-14c8 5 8 13 0 18"/>',
 cast:'<path d="M4 21 16 5M7 17l3 2M16 5c6 0 7 4 4 9s-7 1-6-1"/>',
 trophy:'<path d="M7 3h10v6c0 7-10 7-10 0Zm0 2H3v3c0 3 3 4 5 4M17 5h4v3c0 3-3 4-5 4M12 14v6M8 21h8"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'
};
export function icon(name:string,size=20){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.fish}</svg>`;}
export function lureArt(id:string,color:string){const body:Record<string,string>={
 jig:`<path d="M22 30c14-10 29-11 44-7l13 8-11 9C47 44 32 39 22 30Z" fill="${color}"/><path d="M66 24c11-12 13-6 8-1l12 3-7 5" fill="${color}"/><circle cx="27" cy="29" r="3" fill="#363e34"/><path d="M38 35v13c0 10 10 10 10 2l-3 4"/>`,
 spoon:`<ellipse cx="47" cy="28" rx="27" ry="12" transform="rotate(-24 47 28)" fill="${color}"/><ellipse cx="47" cy="28" rx="19" ry="7" transform="rotate(-24 47 28)" fill="#dfb97d"/><circle cx="68" cy="18" r="2" fill="#555d4c"/><path d="M24 38v11m0-3c-10-1-7 10 0 3 7 7 10-4 0-3"/>`,
 crank:`<path d="M19 29c14-17 38-15 55 0-18 17-42 17-55 0Z" fill="${color}"/><path d="M20 32 10 44l20-7" fill="#d1d7c5"/><path d="m33 29 3-9m6 10 3-12m5 12 3-10" stroke="#77805a"/><circle cx="26" cy="28" r="3" fill="#263b2b"/><path d="M37 40v10m0-3c-8 0-6 8 0 4 6 4 8-4 0-4M70 32v10m0-3c-8 0-6 8 0 4 6 4 8-4 0-4"/>`,
 spinner:`<path d="m30 12 28 36"/><ellipse cx="40" cy="23" rx="9" ry="17" transform="rotate(-30 40 23)" fill="${color}"/><path d="M53 38c-8 14-1 17 4 12 6 5 11 0 0-12"/><path d="m55 37 11 7m-10-6-9 12" stroke="#b37b51"/>`,
 jerk:`<path d="M13 31c21-12 46-10 72-1-26 9-48 10-72 1Z" fill="${color}"/><path d="M16 29c25-10 45-9 64 0" stroke="#4d6750"/><circle cx="20" cy="29" r="2.5" fill="#262f26"/><path d="M37 36v13m0-3c-8 0-6 8 0 4 6 4 8-4 0-4M73 34v11m0-3c-8 0-6 8 0 4 6 4 8-4 0-4"/>`,
 worm:`<path d="M18 29c5-15 16-18 21-5s7 17 14 4 13-8 16 0 9 6 11-1" stroke="${color}" stroke-width="8"/><path d="M43 31v17c0 11 16 12 16 0l-4 4"/>`
};return `<svg viewBox="0 0 96 68" fill="none" stroke="#53604c" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">${body[id]}</svg>`;}
export function fishArt(color:string){return `<svg viewBox="0 0 160 75" fill="none" aria-hidden="true"><path d="M22 38C49 11 94 15 119 32L145 15V61L119 44C88 66 49 60 22 38Z" fill="${color}"/><path d="m65 25 12-14 15 14M63 54l14 14 15-14" fill="${color}" opacity=".7"/><path d="M44 27c8 7 8 17 0 22M76 24v28m12-29 0 29m12-26v23" stroke="#334735" opacity=".4"/><circle cx="36" cy="35" r="3" fill="#283b2f"/></svg>`;}
