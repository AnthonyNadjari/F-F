# Signatures email — Finck & Fisch

Huit compositions, un seul jeu de coordonnees. Toutes en noir et blanc, mais
construites differemment : ce qui les distingue, c'est la mise en page et les
contrastes d'echelle, pas la couleur.

| | Composition | Pour quoi |
|---|---|---|
| A | **Filet** | Nom en grand serif, filet court, coordonnees empilees. Le choix par defaut. |
| B | **Colonnes** | Identite a gauche, coordonnees a droite. Compact en hauteur. |
| C | **Bandeau** | Nom du studio en reserve sur noir. Sans logo : il faudrait l'export blanc. |
| D | **Centree** | Symetrique et sobre, pour les mails courts. |
| E | **Bornes** | Bloc tenu entre deux filets. Tient bon quand le client mail ecrase les marges. |
| F | **Fiche** | Coordonnees etiquetees E / T / W, quand il y a beaucoup a donner. |
| G | **Compacte** | Deux lignes, a regler comme signature de **reponse**. |
| H | **Logo centre** | Le monogramme en grand, seul en tete. La plus proche d'une carte de visite. |

Plus une version texte brut, la seule que garde iOS.

## Deux facons de generer

- **Le generateur** (`generateur.html`, publie en ligne) : on remplit les
  champs, les huit versions s'affichent cote a cote, on copie celle qu'on veut.
  C'est la voie a donner a quelqu'un qui ne touche pas au code. Il s'ouvre en
  ligne, pas en double-cliquant le fichier : il charge `variants.mjs` en module.
- **Le script** : `node brand/signature/build.mjs`, qui ecrit tout dans `dist/`
  avec une page d'apercu. Pour une autre personne, dupliquer `variables.json`
  (ex. `charles.json`) et lancer `build.mjs --vars brand/signature/charles.json`.

## Source unique

Les compositions vivent dans **`variants.mjs`**, utilise a la fois par le script
et par le generateur. Une composition modifiee la l'est partout : il n'y a pas
de copie du HTML ailleurs, et il ne faut pas en creer.

Pour ajouter une composition : une fonction qui recoit les valeurs et renvoie du
HTML, puis une entree dans `VARIANTS`. Elle apparait automatiquement dans le
generateur et dans `dist/`.

## Le logo

Quatre compositions (filet, colonnes, fiche, logo centre) portent le
monogramme du studio. Il est **embarque en base64** dans `logo-embed.mjs`,
genere par `brand/logo/vectorise.py` : l'image part avec le copier-coller et
Gmail la reheberge au collage, donc elle s'affiche sans domaine ni
hebergement.

Les quatre autres sont typographiques : le bandeau parce qu'un logo noir
disparaitrait sur du noir (il faudrait l'export blanc), les autres pour laisser
un vrai choix entre une signature avec marque et une signature sans.

Pour pointer vers un logo heberge plutot que l'embarque, renseigner `LOGO_URL`
dans `variables.json`. Dans le generateur, « Remplacer le logo » charge un
fichier local, qui ne quitte pas le navigateur.

## Champs

| Cle | Exemple | Note |
|---|---|---|
| `NOM_COMPLET` | `Anthony Nadjari` | |
| `ROLE` | `Fondateur` | |
| `EMAIL` | `anthony@finckfisch.fr` | |
| `TELEPHONE` | `+33 6 00 00 00 00` | Le lien `tel:` est deduit automatiquement |
| `SITE` | `finckfisch.fr` | Sans `https://`, il est ajoute au lien |
| `LOGO_URL` | vide | Vide = monogramme embarque. Une URL https pour un logo heberge |

## Installation

- **Gmail (web)** — Parametres → Voir tous les parametres → Generale → Signature.
  Coller le **rendu**, pas le code. Definir une signature pour les nouveaux
  messages et une autre pour les reponses (la compacte).
- **Outlook (web)** — Parametres → Courrier → Composer et repondre → Signature.
- **Outlook (Windows)** — Fichier → Options → Courrier → Signatures. Le moteur de
  rendu est celui de Word : les capitales espacees peuvent bouger legerement.
- **Apple Mail** — Reglages → Signatures, en decochant « Toujours utiliser la
  police par defaut », sinon la mise en forme est ecrasee.
- **iPhone** — iOS ne garde pas le HTML : utiliser la version texte.

## Regles a ne pas casser

Les clients mail ne sont pas des navigateurs. Ce qui est en place est delibere :

- **Tout en styles inline**, jamais de `<style>` ni de classes : Gmail et Outlook
  les suppriment.
- **Tableaux, pas de flexbox ni de grid** : Outlook Windows rend le HTML avec le
  moteur de Word, qui ne connait ni l'un ni l'autre.
- **Polices systeme uniquement** (Georgia, Arial). Une webfont ne se charge pas
  et le texte retomberait sur une police imprevisible.
- **Pas de SVG** : Gmail les supprime. Pour la composition H, un PNG a fond
  transparent, exporte en x2, avec `width` et `height` explicites.
- **Filets en cellules de 1px avec `bgcolor`**, pas en `border` : bien plus
  fiable sur Outlook.
- **Couleur forcee sur les liens**, sur le `<a>` *et* sur un `<span>` interieur,
  sinon iOS et Gmail les repassent en bleu souligne.
- **Mode sombre** : les clients inversent les couleurs eux-memes, cela ne se
  pilote pas depuis une signature. D'ou le fond transparent et le gris moyen
  pour les lignes secondaires, lisible dans les deux sens.
