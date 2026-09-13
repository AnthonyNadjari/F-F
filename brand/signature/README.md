# Signature email — Finck & Fisch

Une seule composition : logo a gauche sur toute la hauteur, filet vertical,
identite et coordonnees a droite. Plus une version texte brut, la seule que
garde iOS.

Sept autres compositions ont ete explorees puis ecartees ; elles restent dans
l'historique git (commit 3638374) si besoin d'y revenir.

## Deux facons de generer

- **Le generateur** (`generateur.html`, publie en ligne) : on remplit les
  champs, on copie. C'est la voie a donner a quelqu'un qui ne touche pas au
  code. La version publiee est `dist/generateur.html`, produite par
  `build.mjs` : un seul fichier, sans import, donc elle s'ouvre aussi en
  double-cliquant.
- **Le script** : `node brand/signature/build.mjs`. Pour une autre personne,
  dupliquer `variables.json` (ex. `charles.json`) et lancer
  `build.mjs --vars brand/signature/charles.json`.

La composition vit dans **`variants.mjs`**, utilise par les deux. Il n'y a pas
de copie du HTML ailleurs, et il ne faut pas en creer.

## Champs

| Cle | Exemple | Note |
|---|---|---|
| `NOM_COMPLET` | `Anthony Nadjari` | |
| `ROLE` | `Fondateur` | Tient sur une ligne avec le nom du studio |
| `EMAIL` | `anthony@finckfisch.fr` | |
| `TELEPHONE` | `+33 6 00 00 00 00` | Le lien `tel:` est deduit automatiquement |
| `SITE` | `finckfisch.fr` | Sans `https://`, il est ajoute au lien |
| `LOGO_URL` | vide | Vide = monogramme embarque. Une URL https pour un logo heberge |

## Le logo

Le monogramme est **embarque en base64** dans `logo-embed.mjs`, genere par
`brand/logo/vectorise.py` : l'image part avec le copier-coller et Gmail la
reheberge au collage, donc elle s'affiche sans domaine ni hebergement.

Sa hauteur est calee en dur sur celle du bloc texte (`HAUTEUR_BLOC`, 132 px) :
nom, role, filet et ses marges, trois lignes de coordonnees. Toucher a une de
ces tailles impose de reprendre ce nombre.

## Choix typographiques

Le nom et les coordonnees sont en Georgia, pas en Arial : c'est le serif
systeme le plus proche du Didone du logo, et ses chiffres sont elzeviriens
(ils montent et descendent), ce qui donne un dessin au numero de telephone au
lieu d'un alignement de batons. Le role reste en sans-serif, en petites
capitales espacees, pour trancher avec les deux.

## Installation

- **Gmail (web)** — Parametres → Voir tous les parametres → Generale →
  Signature. Coller le **rendu**, pas le code.
- **Outlook (web)** — Parametres → Courrier → Composer et repondre → Signature.
- **Outlook (Windows)** — Fichier → Options → Courrier → Signatures. Le moteur
  de rendu est celui de Word : les capitales espacees peuvent bouger un peu.
- **Apple Mail** — Reglages → Signatures, en decochant « Toujours utiliser la
  police par defaut », sinon la mise en forme est ecrasee.
- **iPhone** — iOS ne garde pas le HTML : utiliser la version texte.

## Regles a ne pas casser

- **Tout en styles inline**, jamais de `<style>` ni de classes : Gmail et
  Outlook les suppriment.
- **Tableaux, pas de flexbox ni de grid** : Outlook Windows rend le HTML avec
  le moteur de Word, qui ne connait ni l'un ni l'autre.
- **Polices systeme uniquement** : une webfont ne se charge pas et le texte
  retomberait sur une police imprevisible.
- **Pas de SVG** : Gmail les supprime. Le logo part donc en PNG.
- **Filets en cellules de 1px avec `bgcolor`**, pas en `border` : bien plus
  fiable sur Outlook.
- **Couleur forcee sur les liens**, sur le `<a>` *et* sur un `<span>`
  interieur, sinon iOS et Gmail les repassent en bleu souligne.
- **Mode sombre** : les clients inversent les couleurs eux-memes, cela ne se
  pilote pas depuis une signature. D'ou le fond transparent et une encre
  adoucie plutot qu'un gris clair, lisible dans les deux sens.
