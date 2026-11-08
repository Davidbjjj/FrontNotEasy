/**
 * Roda o axe-core (WCAG 2.0/2.1 A e AA) em todas as stories do Storybook.
 *
 * Uso:
 *   npm run build-storybook
 *   npx http-server storybook-static -p 6006 -s &
 *   npm run test:a11y            # STORYBOOK_URL=http://localhost:6006 por padrão
 *
 * Sai com código 1 se alguma story tiver violações.
 * (o test-runner oficial conflita com o Jest do react-scripts)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL_BASE = process.env.STORYBOOK_URL || 'http://localhost:6006';
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

(async () => {
  const idx = await (await fetch(`${URL_BASE}/index.json`)).json();
  const stories = Object.values(idx.entries).filter((e) => e.type === 'story');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  let bad = 0;

  for (const s of stories) {
    await page.goto(`${URL_BASE}/iframe.html?id=${s.id}&viewMode=story`);
    await page.waitForTimeout(700);
    await page.evaluate(axeSource);
    const res = await page.evaluate(
      (tags) => window.axe.run(document.body, { runOnly: { type: 'tag', values: tags } }),
      TAGS
    );
    if (res.violations.length) {
      bad++;
      console.log('FAIL', s.id);
      res.violations.forEach((v) =>
        console.log('  -', v.id, v.help, v.nodes.map((n) => n.target.join(' ')).join(' | '))
      );
    } else {
      console.log('ok  ', s.id);
    }
  }

  await browser.close();
  console.log(`\n${stories.length} stories, ${bad} com violações`);
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
