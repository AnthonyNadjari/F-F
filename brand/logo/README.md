# Logo — Finck & Fisch

```
source/f_and_f_logo.png   Le fichier d'origine. Ne jamais l'ecraser.
source/logo-master.svg    Vectorisation du fichier d'origine
export/                   Derives, tous regeneres : ne rien y retoucher a la main
vectorise.py              Ce qui produit tout ce qui precede
```

## Regenerer

```bash
pip install pillow && apt-get install potrace
python3 brand/logo/vectorise.py
```

Le fichier d'origine est un PNG carre sur fond creme, sans transparence. Le
script en tire tout le reste :

1. **Detourage** — la couche alpha est calculee a partir de la luminosite, entre
   la valeur dominante des bords (le fond) et la plus sombre (l'encre). Un
   simple seuil crenellerait les courbes du Didone ; l'interpolation garde
   l'anticrenelage. Les valeurs sous 16/255 sont ramenees a zero : le fichier
   d'origine a un grain leger qui, sans ce plancher, compte comme de l'encre et
   fait echouer tous les recadrages.
2. **Decoupe** — le verrouillage est separe en trois bandes (monogramme, nom,
   baseline) en cherchant les lignes vides, pas avec des coordonnees en dur :
   si le logo d'origine change, le script suit.
3. **Tracage** — potrace, sur une version agrandie x2 et binarisee. L'image est
   inversee avant : en PBM, c'est le noir qui est de l'encre, l'inverse de la
   couche alpha. Sans cela potrace trace le fond.
4. **Sorties** — les SVG, les PNG a fond transparent, et le monogramme en
   base64 pour les signatures email (`brand/signature/logo-embed.mjs`).

## Ce que contient export/

| Fichier | Usage |
|---|---|
| `monogram.svg` · `monogram-blanc.svg` | Monogramme seul, fonds clairs et sombres |
| `logo-horizontal.svg` · `-blanc.svg` | Monogramme a gauche, nom a droite : en-tetes, factures |
| `logo-complet-blanc.svg` | Verrouillage complet sur fond sombre |
| `monogram@2x.png` · `monogram.png` | Signature email, avatars — Gmail supprime les SVG |
| `monogram-blanc@2x.png` | Le meme sur fond sombre |
| `logo-complet@2x.png` · `-blanc@2x.png` | Documents, presentations |
| `favicon-512.png` · `favicon-32.png` | Onglet navigateur, PWA |
| `apple-touch-icon.png` | Ecran d'accueil iOS |

Les PNG sont a fond transparent et exportes en x2 : un fond blanc en dur se
voit des que le logo est pose ailleurs que sur du blanc, et sans le x2 il est
flou sur les ecrans Retina.

## Couleurs de la marque

| Role | Hex |
|---|---|
| Encre (logo, titres) | `#111111` |
| Papier (fond) | `#F5F4F0` |
| Texte secondaire | `#77716A` |
| Filets, separateurs | `#DCD7D0` |
