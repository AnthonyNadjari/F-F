#!/usr/bin/env node
/**
 * Construit le site du studio a partir de site/page.html.
 *
 *   node site/build.mjs
 *
 * Deux sorties, depuis une seule source :
 *
 *   dist/index.html   document complet, c'est ce qui se deploie
 *   dist/apercu.html  le meme sans <!doctype>, <html>, <head> ni <body>,
 *                     pour la publication en Artifact qui fournit son propre
 *                     squelette : publier le document complet l'imbriquerait
 *                     dans un second, et le <title> serait ignore
 *
 * Le monogramme est injecte depuis brand/logo/export/ plutot que recopie :
 * une seule source pour le logo, celle que produit vectorise.py.
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, '..');
const DIST = join(ROOT, 'dist');
const LOGOS = join(REPO, 'brand/logo/export');

mkdirSync(DIST, { recursive: true });

/* ---------- logo ---------- */

const monogramme = readFileSync(join(LOGOS, 'monogram.svg'), 'utf8');

// On ne garde que le dessin, sans l'en-tete du fichier : la couleur doit venir
// de la page (currentColor) et non du `color` fige dans le SVG exporte.
const viewBox = monogramme.match(/viewBox="([^"]+)"/)[1];
const dessin = monogramme.match(/<g color="[^"]*">([\s\S]*?)<\/g>\s*<\/svg>/)[1].trim();

const inline =
  `<svg viewBox="${viewBox}" fill="currentColor" role="img" aria-label="Finck &amp; Fisch">` +
  `${dessin}</svg>`;

/* ---------- pages ---------- */

const source = readFileSync(join(ROOT, 'page.html'), 'utf8');
if (!source.includes('<!--MONOGRAMME-->')) {
  throw new Error('Aucun emplacement <!--MONOGRAMME--> dans page.html');
}
const complet = source.replaceAll('<!--MONOGRAMME-->', () => inline);

writeFileSync(join(DIST, 'index.html'), complet, 'utf8');
console.log(`  ok  site/dist/index.html  (${Math.round(complet.length / 1024)} Ko)`);

const apercu = complet
  .replace(/^[\s\S]*?<title>/, '<title>')
  .replace(/<\/head>\s*<body>/, '')
  .replace(/<\/body>\s*<\/html>\s*$/, '')
  .replace(/<link rel="icon"[^>]*>\s*/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\s*/, '');

if (/<!doctype|<html|<\/body>/i.test(apercu)) {
  throw new Error('Le squelette HTML survit dans apercu.html');
}

writeFileSync(join(DIST, 'apercu.html'), apercu, 'utf8');
console.log(`  ok  site/dist/apercu.html  (${Math.round(apercu.length / 1024)} Ko)`);

/* ---------- icones ---------- */

for (const fichier of ['favicon-512.png', 'apple-touch-icon.png']) {
  copyFileSync(join(LOGOS, fichier), join(DIST, fichier));
  console.log(`  ok  site/dist/${fichier}`);
}

console.log('\nTermine. Repertoire a deployer : site/dist');
