import { test, expect } from '@playwright/test';

test('boating, sonar, loadout, catch, journal persistence, data import, and mobile layout',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('#world canvas')).toBeVisible();await expect.poll(()=>page.evaluate(()=>(window as any).__keitele.state.depthSource)).toBe('survey');
 await expect.poll(()=>page.evaluate(()=>(window as any).__keitele.state.targets)).toBeGreaterThan(0);
 // Boat movement is exercised through the same keys as normal play.
 const start=await page.evaluate(()=>(window as any).__keitele.state.boat.z);
 await page.keyboard.down('w');await page.waitForTimeout(1500);await page.keyboard.up('w');await page.waitForTimeout(1000);
 expect(await page.evaluate(()=>(window as any).__keitele.state.boat.z)).toBeLessThan(start-1);
 await page.locator('#anchor').click();await expect(page.locator('#anchor')).toContainText('Raise anchor');
 const position=await page.evaluate(()=>(window as any).__keitele.state.boat.z);await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');expect(await page.evaluate(()=>(window as any).__keitele.state.boat.z)).toBe(position);
 // The manual beam can point away from the school, and then back at it.
 await page.getByRole('tab',{name:/LiveScope/}).click();await expect(page.locator('#beam-control')).toBeVisible();
 await page.locator('#beam-angle').fill('110');await expect.poll(()=>page.evaluate(()=>(window as any).__keitele.state.targets)).toBe(0);
 await page.locator('#beam-angle').fill('0');await expect.poll(()=>page.evaluate(()=>(window as any).__keitele.state.targets)).toBeGreaterThan(0);
 // Swapping sonar hardware actually removes unsupported modes.
 await page.locator('#configure').click();await page.locator('input[name="sonar"][value="down"]').check();await page.locator('input[name="motor"][value="electric"]').check();await page.locator('input[name="rod"][value="heavy"]').check();await page.locator('input[name="hull"][value="ranger"]').check();await page.locator('#save-boat').click();
 await expect(page.getByRole('tab',{name:/LiveScope/})).toBeDisabled();await expect(page.locator('#hull-name')).toHaveText('Ranger 510');await expect(page.locator('#motor-name')).toContainText('electric');
 await page.locator('[data-lure="spoon"]').click();await expect(page.locator('[data-lure="spoon"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-lure="jig"]').click();
 // The known initial perch school is within cast distance; no test-only state mutation.
 await page.locator('#cast-distance').fill('38');await page.locator('#cast').click();await expect(page.locator('#phase-label')).toHaveText('A LITTLE PATIENCE');
 await expect(page.locator('#bite-alert')).toBeVisible({timeout:25000});await page.locator('#set-hook').click();await expect(page.locator('#fight-overlay')).toBeVisible();
 // Manage drag and line tension using the real UI, through to a landed fish.
 await page.locator('#drag').fill('45');let reeling=false;
 const deadline=Date.now()+65000;
 while(Date.now()<deadline){
  const state=await page.evaluate(()=>(window as any).__keitele.state);if(state.phase!=='fight')break;
  const width=await page.locator('#tension-fill').evaluate(el=>parseFloat((el as HTMLElement).style.width));
  if(!reeling&&width<43){await page.keyboard.down('Space');reeling=true;}
  if(reeling&&width>76){await page.keyboard.up('Space');reeling=false;}
  await page.waitForTimeout(150);
 }
 await page.keyboard.up('Space');await expect(page.locator('#modal-title')).toHaveText('Well, hello there.',{timeout:2000});
 await expect(page.locator('#catch-count')).toHaveText('1');await page.locator('#release-fish').click();await page.locator('#open-logbook').click();await expect(page.locator('.journal-list article')).toHaveCount(1);await page.locator('#close-modal').click();
 await page.reload();await expect(page.locator('#catch-count')).toHaveText('1');await expect(page.locator('#hull-name')).toHaveText('Ranger 510');
 // Imported survey values, rather than the fallback model, drive the readouts.
 await page.locator('#data-info').click();await page.locator('#import-depth').setInputFiles({name:'test-contours.geojson',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({type:'FeatureCollection',features:[{type:'Feature',properties:{depth_m:12},geometry:{type:'LineString',coordinates:[[25.94,62.86],[25.9401,62.86],[25.94,62.8601]]}}]}))});
 await expect(page.locator('#import-status')).toContainText('Loaded 1 contours');await page.locator('#close-modal').click();await expect(page.locator('#depth-kind')).toHaveText('SURVEY DEPTH');await expect(page.locator('#depth')).toHaveText('12.0');
 await page.locator('#open-map').click();await page.locator('[data-chart="survey"]').click();await expect(page.locator('#survey-map')).toBeVisible();await page.screenshot({path:'test-results/keitele-survey-chart.png'});await page.locator('#close-modal').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await expect(page.locator('.touch-steering')).toBeVisible();
 expect(errors).toEqual([]);
});
