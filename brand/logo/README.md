# Logo — Finck & Fisch

Le logo est l'actif le plus durable du studio : il vit ici, versionne ici, et
c'est d'ici que partent tous les exports (site, signature, factures, contrats).

```
source/     Fichier master, celui dont tout le reste est derive
export/     Derives prets a l'emploi, jamais retouches a la main
```

## A deposer dans `source/`

Le fichier d'origine, tel quel, sans recadrage ni compression :

- `logo-master.svg` si un vectoriel existe — c'est le format a privilegier,
  il se re-exporte a n'importe quelle taille sans perte ;
- sinon `logo-master.png`, a la plus grande resolution disponible.

Ne jamais ecraser ce fichier. Une nouvelle version du logo = un nouveau
fichier (`logo-master-v2.svg`), pour garder l'historique lisible.

## A generer dans `export/`

| Fichier | Contenu | Usage |
|---|---|---|
| `logo-full.png` | Monogramme + FINCK & FISCH + DIGITAL STUDIO | Documents, presentations |
| `logo-horizontal.png` | Monogramme a gauche, nom a droite | En-tete de site, factures |
| `monogram.png` | `F&F` seul | Signature email, avatar, tampon |
| `monogram@2x.png` | `F&F` seul, 120 x 120 | Variante « avec logo » de la signature |
| `favicon-32.png`, `favicon-512.png` | Monogramme seul, cadrage serre | Onglet navigateur, PWA |
| `apple-touch-icon.png` | Monogramme seul, 180 x 180 | Ecran d'accueil iOS |

Chaque export existe en deux versions : noir sur transparent (`-noir`) et blanc
sur transparent (`-blanc`), pour les fonds clairs et les fonds sombres.

## Regles d'export

- **Fond transparent**, jamais de blanc « en dur » : un fond blanc se voit des
  que le logo est pose sur autre chose que du blanc.
- **PNG pour les usages mail**, SVG partout ailleurs. Gmail supprime les SVG
  (voir `brand/signature/README.md`).
- **Exporter en x2** puis afficher a la moitie de la taille, sinon le logo est
  flou sur les ecrans Retina.
- **Garder les fichiers legers** (< 1 Mo). Git versionne mal les gros binaires :
  chaque modification stocke une copie complete.

## Couleurs de la marque

| Role | Hex |
|---|---|
| Encre (logo, titres) | `#111111` |
| Papier (fond) | `#F5F4F0` |
| Texte secondaire | `#77716A` |
| Filets, separateurs | `#DCD7D0` |
