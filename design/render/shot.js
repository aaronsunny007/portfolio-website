const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, out, qs] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 700 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('http://127.0.0.1:8765/index.html?' + qs);
  await p.waitForFunction('window.__done===true', { timeout: 120000 });
  console.log('plate', JSON.stringify(await p.evaluate('[window.__plate, window.__swapped]')));
  await p.locator('#c').screenshot({ path: out, omitBackground: true });
  await b.close();
})();
