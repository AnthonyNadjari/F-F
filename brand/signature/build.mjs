#!/usr/bin/env node
/**
 * Genere les signatures email a partir de templates/ + variables.json.
 *
 *   node brand/signature/build.mjs
 *   node brand/signature/build.mjs --vars brand/signature/charles.json
 *
 * Sortie : brand/signature/dist/ (une signature par variante, + un apercu
 * navigateur). Le dossier dist/ est ignore par git : chacun genere la sienne.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(ROOT, 'templates');
const DIST = join(ROOT, 'dist');

const varsArg = process.argv.indexOf('--vars');
const varsPath = varsArg !== -1 ? process.argv[varsArg + 1] : join(ROOT, 'variables.json');

const vars = JSON.parse(readFileSync(varsPath, 'utf8'));
delete vars._commentaire;

/** Echappe les caracteres qui casseraient le HTML (ex: un nom avec &). */
const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(template, isHtml) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in vars)) {
      console.warn(`  ! placeholder inconnu, laisse tel quel : ${match}`);
      return match;
    }
    return isHtml ? escapeHtml(vars[key]) : String(vars[key]);
  });
}

mkdirSync(DIST, { recursive: true });

const files = readdirSync(TEMPLATES).sort();
const built = [];

for (const file of files) {
  const isHtml = file.endsWith('.html');
  const out = render(readFileSync(join(TEMPLATES, file), 'utf8'), isHtml);
  writeFileSync(join(DIST, file), out, 'utf8');
  built.push({ file, out, isHtml });
  console.log(`  ok  dist/${file}`);
}

// Page d'apercu : ouvrir dans un navigateur pour verifier avant de coller.
const apercu = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Apercu signatures — Finck &amp; Fisch</title></head>
<body style="margin:0;padding:48px;background:#FAF9F7;font-family:Arial,Helvetica,sans-serif;color:#111;">
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:20px;letter-spacing:3px;text-transform:uppercase;margin:0 0 40px;">Apercu des signatures</h1>
${built
  .filter((b) => b.isHtml)
  .map(
    (b) => `<section style="margin:0 0 40px;">
  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A39C93;margin:0 0 14px;">${basename(b.file, '.html')}</div>
  <div style="background:#FFFFFF;border:1px solid #EAE6E1;padding:28px;">${b.out}</div>
</section>`
  )
  .join('\n')}
</body></html>`;

writeFileSync(join(DIST, 'apercu.html'), apercu, 'utf8');
console.log(`  ok  dist/apercu.html`);
console.log(`\nTermine. Ouvre brand/signature/dist/apercu.html pour verifier, puis copie-colle.`);
