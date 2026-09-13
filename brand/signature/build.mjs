#!/usr/bin/env node
/**
 * Genere les signatures email a partir de variants.mjs + variables.json.
 *
 *   node brand/signature/build.mjs
 *   node brand/signature/build.mjs --vars brand/signature/charles.json
 *
 * Sortie : brand/signature/dist/ — une signature par composition, la version
 * texte, et une page d'apercu a ouvrir dans un navigateur. dist/ est ignore
 * par git : chacun genere la sienne avec ses coordonnees.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VARIANTS, plain, normalise, esc } from './variants.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');

const varsArg = process.argv.indexOf('--vars');
const varsPath = varsArg !== -1 ? process.argv[varsArg + 1] : join(ROOT, 'variables.json');

const vars = JSON.parse(readFileSync(varsPath, 'utf8'));
delete vars._commentaire;

mkdirSync(DIST, { recursive: true });

const rendus = VARIANTS.map((v) => ({ ...v, html: v.render(normalise(vars)) }));

for (const v of rendus) {
  writeFileSync(join(DIST, `${v.id}.html`), v.html, 'utf8');
  console.log(`  ok  dist/${v.id}.html`);
}

writeFileSync(join(DIST, 'signature.txt'), plain(vars), 'utf8');
console.log('  ok  dist/signature.txt');

const apercu = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Signatures — Finck &amp; Fisch</title></head>
<body style="margin:0;padding:40px 24px;background:#F5F4F0;font-family:Arial,Helvetica,sans-serif;color:#111;">
<div style="max-width:860px;margin:0 auto;">
${rendus
  .map(
    (v) => `<section style="margin:0 0 34px;">
  <div style="display:flex;gap:14px;align-items:baseline;font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:#A39C93;margin:0 0 10px;">
    <span style="color:#111;font-weight:bold;">${esc(v.nom)}</span><span>${esc(v.note)}</span>
  </div>
  <div style="background:#FFFFFF;border:1px solid #E3DED6;padding:30px;">${v.html}</div>
</section>`
  )
  .join('\n')}
</div>
</body></html>`;

writeFileSync(join(DIST, 'apercu.html'), apercu, 'utf8');
console.log('  ok  dist/apercu.html');

/*
 * Generateur autonome : le meme page, mais avec variants.mjs et logo-embed.mjs
 * aplatis dedans. C'est cette version-la qu'on publie et qu'on ouvre en
 * double-cliquant : un seul fichier, aucun import, donc rien qui puisse echouer
 * au chargement des modules.
 */
const aplatir = (source) =>
  source
    .split('\n')
    .filter((l) => !/^\s*import\s.+from\s+['"]\.\//.test(l))
    .map((l) => l.replace(/^export\s+(const|function|class|let)\s/, '$1 '))
    .join('\n');

const page = readFileSync(join(ROOT, 'generateur.html'), 'utf8');
const balise = page.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!balise) {
  throw new Error('Balise <script type="module"> introuvable dans generateur.html');
}

const modules = ['logo-embed.mjs', 'variants.mjs']
  .map((f) => aplatir(readFileSync(join(ROOT, f), 'utf8')))
  .join('\n');

const autonome = page.replace(
  balise[0],
  () => `<script>\n${modules}\n${aplatir(balise[1])}\n</script>`
);

const script = autonome.match(/<script>([\s\S]*?)<\/script>/)[1];
if (/^\s*(import|export)\s/m.test(script)) {
  throw new Error('Un import ou un export a survecu a l aplatissement');
}

writeFileSync(join(DIST, 'generateur.html'), autonome, 'utf8');
console.log(`  ok  dist/generateur.html  (autonome, ${Math.round(autonome.length / 1024)} Ko)`);
console.log('\nTermine. Ouvre brand/signature/dist/apercu.html, puis copie le rendu.');
