# Finck & Fisch — Digital Studio

Repo interne du studio : identite de marque, ressources partagees et outils de
production. Les sites clients vivent dans leurs propres repos, un par client.

## Structure

```
brand/
  logo/             Logo : fichier d'origine, vectorisation, exports
  signature/        Signature email : generateur et installation
site/
  page.html         Le site du studio : une page, sans framework
  build.mjs         Injecte le logo et ecrit dist/, le repertoire a deployer
commercial/
  brief-client.html Le formulaire rempli pendant l'appel de cadrage
  devis-type.md     Modele de devis
  contrat-prestation.md   Contrat et cession de droits
  tarifs.md         Formules, options, comment chiffrer
```

## Marque

- Nom : **Finck & Fisch**, baseline **Digital Studio**
- Palette : noir `#111111`, papier `#F5F4F0`, gris secondaire `#77716A`,
  filets `#DCD7D0`
- Typographie : serif haut de gamme pour le nom et le monogramme, sans-serif
  neutre pour le texte courant
