# Site du studio

Une page, sans dépendance ni étape de compilation côté navigateur.

```
page.html    La source, avec <!--MONOGRAMME--> comme emplacement du logo
build.mjs    Injecte le logo et écrit dist/
dist/        Ce qui se déploie — ignoré par git, régénéré
```

```bash
node site/build.mjs
```

## Pourquoi du HTML et pas React

Une page sans interaction n'a pas besoin d'un framework. Le site s'affiche
instantanément, il n'a aucune dépendance à mettre à jour, et il se déploie
partout. C'est aussi l'argument commercial de la page elle-même : difficile de
vendre la rapidité avec un site lent.

Si le site grossit (blog, plusieurs pages, réalisations dynamiques), passer à
Vite n'a rien de coûteux — le HTML et le CSS se reprennent tels quels.

## Déploiement sur Vercel

1. `vercel` à la racine du repo, en indiquant `site/dist` comme répertoire de
   sortie et aucune commande de build (les fichiers sont déjà construits), ou
   en configurant `node site/build.mjs` comme commande de build.
2. Le site est en ligne sur une adresse `*.vercel.app`, utilisable immédiatement
   pour démarcher.
3. Une fois le domaine acheté : l'ajouter dans Vercel, qui donne les
   enregistrements DNS à créer chez le registrar.

## À remplacer avant la mise en ligne

- **`bonjour@finckfisch.fr`** — l'adresse apparaît à deux endroits dans
  `page.html`. Elle n'existe pas encore.
- **Les mentions légales.** Obligatoires dès qu'un site est publié par une
  entreprise (article 6-III de la LCEN) : dénomination, forme juridique, siège,
  SIRET, directeur de la publication, hébergeur et son adresse. À écrire une
  fois le statut choisi, dans une page `mentions-legales.html`.
- **Les réalisations.** La page n'en montre aucune et assume ce choix : elle
  vend la méthode, le prix et le délai. Dès qu'il y a deux sites à montrer, ils
  prennent la place qu'occupe aujourd'hui « Ce que nous ne faisons pas », qui
  peut descendre.

## Ce qui est délibéré dans la page

- **Le prix et le délai affichés en haut.** La plupart des agences les cachent
  derrière un formulaire. Les afficher filtre les curieux et désarme la
  négociation : le chiffre est public.
- **« Ce que nous ne faisons pas ».** Une liste de refus rassure plus qu'une
  liste de promesses, et évite les appels hors sujet.
- **La section sur les Ordres.** C'est le seul endroit où le studio dit quelque
  chose qu'un concurrent généraliste ne peut pas dire. Elle a sa place en
  hauteur de page.
- **Aucun formulaire de contact.** Un formulaire demande un serveur, un
  traitement de données personnelles et une page de politique dédiée. Une
  adresse email fait le même travail, sans rien de tout ça.
