# Signature email — Finck & Fisch

Signature HTML pour les mails clients. Trois variantes, un seul jeu de variables,
un script qui genere les fichiers prets a coller.

## Deux facons de generer

- **Le generateur** (`generateur.html`) : on remplit les champs, on voit le
  rendu dans une fausse fenetre de mail, on copie. C'est la voie a donner a
  quelqu'un qui ne touche pas au code. Le fichier est aussi publie en ligne.
- **Le script** (`build.mjs`) : pour generer les trois variantes d'un coup, ou
  plusieurs signatures depuis plusieurs fichiers de variables.

Les gabarits du generateur sont une copie de ceux de `templates/` : toute
modification de l'un doit etre reportee dans l'autre.

## Utilisation du script

1. Ouvrir `variables.json` et remplacer les valeurs (elles sont preremplies avec
   des exemples : `prenom@finckfisch.fr`, `+33 6 00 00 00 00`, etc.).
2. Generer :
   ```bash
   node brand/signature/build.mjs
   ```
3. Ouvrir `brand/signature/dist/apercu.html` dans un navigateur pour verifier.
4. Selectionner la signature dans l'apercu, copier (Cmd/Ctrl+C), coller dans le
   client mail. On copie le **rendu**, pas le code source.

Une signature par personne : dupliquer `variables.json` (ex: `charles.json`) et
generer avec `node brand/signature/build.mjs --vars brand/signature/charles.json`.

## Variables

| Cle | Exemple | Note |
|---|---|---|
| `NOM_COMPLET` | `Anthony Nadjari` | Mis en capitales automatiquement |
| `ROLE` | `Fondateur` | |
| `EMAIL` | `anthony@finckfisch.fr` | |
| `TELEPHONE` | `+33 6 00 00 00 00` | Version affichee, avec espaces |
| `TEL_BRUT` | `+33600000000` | Version cliquable `tel:`, sans espaces |
| `SITE` | `finckfisch.fr` | Version affichee, sans `https://` |
| `SITE_URL` | `https://finckfisch.fr` | Version cliquable |
| `LOGO_URL` | `https://finckfisch.fr/brand/monogram@2x.png` | Variante C uniquement |

## Variantes

- **standard** — monogramme texte `F&F` + filet vertical + coordonnees.
  C'est celle par defaut : aucune image, donc rien a heberger et rien qui puisse
  se retrouver bloque par le client mail.
- **compacte** — deux lignes, pour les reponses dans un fil deja long.
- **logo-image** — identique a la standard, mais avec le vrai logo en image.
  A n'utiliser **qu'une fois le domaine achete et le PNG heberge** en https a une
  URL stable. Tant que ce n'est pas le cas, rester sur la standard.

## Installation

- **Gmail (web)** — Parametres → Voir tous les parametres → Generale → Signature →
  Creer. Coller le rendu. Penser a definir la signature par defaut pour les
  nouveaux messages **et** pour les reponses (on peut mettre la compacte en
  reponse).
- **Outlook (web)** — Parametres → Courrier → Composer et repondre → Signature.
- **Outlook (Windows)** — Fichier → Options → Courrier → Signatures. Le moteur de
  rendu est Word : le filet vertical et les capitales espacees peuvent legerement
  bouger, c'est normal et prevu.
- **Apple Mail** — Reglages → Signatures. Decocher « Toujours utiliser la police
  par defaut », sinon la mise en forme est ecrasee.
- **iPhone** — iOS ne garde pas le HTML : utiliser `signature.txt`.

## Regles a ne pas casser

Les clients mail ne sont pas des navigateurs. Ce qui est en place est deliberé :

- **Tout en styles inline.** Ne jamais ajouter de `<style>` ni de classes CSS,
  Gmail et Outlook les suppriment.
- **Tableaux, pas de flexbox ni de grid.** Outlook Windows rend le HTML avec le
  moteur de Word, qui ne connait ni l'un ni l'autre.
- **Polices systeme uniquement** (Georgia / Arial). Pas de Google Fonts : les
  webfonts ne se chargent pas dans la majorite des clients, et le texte
  retomberait sur une police par defaut imprevisible.
- **Pas de SVG.** Gmail supprime les images SVG. Si logo il y a : PNG a fond
  transparent, exporte en x2, affiche avec `width`/`height` explicites.
- **Filets en cellules de 1px avec `bgcolor`**, pas en `border`. Rendu bien plus
  fiable sur Outlook.
- **Couleur forcee sur les liens** (sur le `<a>` *et* sur un `<span>` interieur),
  sinon iOS et Gmail repassent les liens en bleu souligne.
- **Mode sombre** : les clients inversent les couleurs eux-memes et cela ne se
  pilote pas depuis une signature. D'ou le fond transparent et le gris moyen
  (`#77716A`) pour les lignes secondaires — il reste lisible dans les deux sens.
