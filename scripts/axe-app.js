/**
 * Auditoria axe (WCAG A/AA) + teclado nas telas reais da aplicação.
 *
 * Usa o build de produção servido em APP_URL, uma sessão falsa por papel
 * (JWT sem assinatura em localStorage) e a API mockada (toda chamada ao
 * back-end responde 200 com lista vazia), então cobre layout, estados vazios
 * e navegação, não dados reais.
 *
 * Uso:
 *   npx react-scripts build
 *   npx http-server build -p 3000 -s --proxy "http://localhost:3000?" &
 *   node scripts/axe-app.js
 */
const fs = require('fs');
const { chromium } = require('playwright');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const fakeJwt = (role) =>
  `${b64({ alg: 'none' })}.${b64({ role, userId: '1', nome: 'Maria Teste', exp: 4102444800 })}.x`;

const PAGES = [
  { role: null, paths: ['/', '/login', '/cadastro-instituicao', '/redefinir-senha', '/access-denied', '/rota-inexistente'] },
  { role: 'ALUNO', paths: ['/disciplinas', '/atividades', '/listas', '/questoes', '/disciplinas/1'] },
  { role: 'PROFESSOR', paths: ['/disciplinas', '/atividades', '/listas'] },
  { role: 'INSTITUICAO', paths: ['/instituicao'] },
];
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, celular: { width: 375, height: 700 } };

async function run() {
  const browser = await chromium.launch();
  const results = [];
  const keyboard = [];

  for (const { role, paths } of PAGES) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const ctx = await browser.newContext({ viewport });
      if (role) {
        await ctx.addInitScript(
          ([token, r]) => {
            localStorage.setItem('token', token);
            localStorage.setItem('role', r);
            localStorage.setItem('userId', '1');
          },
          [fakeJwt(role), role]
        );
      }
      await ctx.route('http://localhost:8080/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      );
      const page = await ctx.newPage();

      for (const p of paths) {
        const label = `${role || 'visitante'} ${p} [${vpName}]`;
        try {
          await page.goto(APP_URL + p, { waitUntil: 'networkidle' });
          await page.waitForTimeout(600);
          await page.evaluate(axeSource);
          const res = await page.evaluate(
            (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
            TAGS
          );
          results.push({ label, violations: res.violations });

          if (vpName === 'desktop') {
            // Teclado: Tab até 40x; todo elemento focado precisa ter indicador de foco visível
            let noIndicator = new Set();
            let reached = 0;
            for (let i = 0; i < 40; i++) {
              await page.keyboard.press('Tab');
              const info = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) return null;
                const cs = getComputedStyle(el);
                const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
                const shadow = cs.boxShadow && cs.boxShadow !== 'none';
                const name = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}`;
                return { name, ok: outline || shadow };
              });
              if (!info) continue;
              reached++;
              if (!info.ok) noIndicator.add(info.name);
            }
            keyboard.push({ label, reached, noIndicator: [...noIndicator] });
          }
        } catch (e) {
          results.push({ label, error: String(e.message || e).split('\n')[0] });
        }
      }
      await ctx.close();
    }
  }
  await browser.close();

  // ---- relatório
  const byRule = {};
  for (const r of results) {
    if (r.error) {
      console.log('ERRO ', r.label, r.error);
      continue;
    }
    console.log(r.violations.length ? 'FAIL ' : 'ok   ', r.label, r.violations.map((v) => v.id).join(','));
    for (const v of r.violations) {
      const k = v.id;
      byRule[k] = byRule[k] || { help: v.help, impact: v.impact, pages: new Set(), samples: new Set() };
      byRule[k].pages.add(r.label);
      v.nodes.slice(0, process.env.DETAIL ? 50 : 3).forEach((n) =>
        byRule[k].samples.add(process.env.DETAIL ? `${n.target.join(' ').slice(-90)}  ::  ${n.html.slice(0, 140)}  ::  ${(n.any[0] && n.any[0].message || '').slice(0, 110)}` : n.target.join(' '))
      );
    }
  }
  console.log('\n===== Violações por regra =====');
  for (const [id, v] of Object.entries(byRule)) {
    const sep = process.env.DETAIL ? '\n    ' : ' | ';
    const shown = [...v.samples].slice(0, process.env.DETAIL ? 60 : 4).join(sep);
    console.log(`\n${id} (${v.impact}) — ${v.help}\n  telas: ${v.pages.size}\n  ex.: ${shown}`);
  }
  console.log('\n===== Teclado (desktop) =====');
  for (const k of keyboard) {
    console.log(`${k.label}: ${k.reached} elementos focados; sem indicador de foco: ${k.noIndicator.join(', ') || '—'}`);
  }
  process.exit(Object.keys(byRule).length ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(2);
});
