/**
 * Signature email Finck & Fisch — source unique.
 *
 * Utilise a la fois par build.mjs (generation en ligne de commande) et par
 * generateur.html (page de copie), qui l'aplatit dedans a la construction.
 *
 * Contraintes des clients mail, qui expliquent tout ce qui suit :
 * tableaux uniquement (Outlook Windows rend le HTML avec le moteur de Word,
 * qui ignore flexbox et grid), styles inline uniquement (Gmail supprime les
 * <style>), polices systeme uniquement (une webfont ne se charge pas), filets
 * en cellules de 1px avec bgcolor plutot qu'en border, et couleur forcee sur
 * le <a> ET sur un <span> interieur sinon iOS repasse les liens en bleu.
 *
 * Les sept autres compositions explorees ont ete retirees au profit de
 * celle-ci ; elles restent dans l'historique git (commit 3638374).
 */

import { MONOGRAMME } from './logo-embed.mjs';

const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = 'Arial,Helvetica,sans-serif';

const INK = '#111111';
const CONTACT = '#33302C';  // encre adoucie : les coordonnees ne doivent pas
                            // rivaliser avec le nom, mais rester franchement
                            // lisibles sur un fond clair comme sombre
const RULE = '#DCD7D0';
const FAINT = '#A39C93';

export const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Deduit les champs calcules (lien tel:, URL du site, source du logo). */
export function normalise(raw) {
  const v = { ...raw };
  v.TELEPHONE = (v.TELEPHONE || '').trim();
  v.TEL_BRUT = v.TELEPHONE.replace(/[^\d+]/g, '');

  const bare = (v.SITE || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  v.SITE = bare;
  v.SITE_URL = bare ? 'https://' + bare : '';

  // Un fichier charge dans le navigateur prime sur une URL hebergee, qui prime
  // sur le monogramme du studio embarque. Le ratio suit la source retenue :
  // celui du monogramme est connu, celui d'un fichier tiers est mesure ailleurs.
  const fourni = v.LOGO_DATA || v.LOGO_URL;
  v.LOGO_SRC = fourni || MONOGRAMME.src;
  v.LOGO_RATIO = fourni
    ? (Number(v.LOGO_RATIO) > 0 ? Number(v.LOGO_RATIO) : 1)
    : MONOGRAMME.ratio;

  return v;
}

/* ---------- fragments ---------- */

const a = (href, label, color) =>
  `<a href="${href}" style="color:${color};text-decoration:none;"><span style="color:${color};text-decoration:none;">${label}</span></a>`;

const mail = (v) => a('mailto:' + esc(v.EMAIL), esc(v.EMAIL), CONTACT);
const tel = (v) => a('tel:' + esc(v.TEL_BRUT), esc(v.TELEPHONE), CONTACT);
const site = (v) => a(esc(v.SITE_URL), esc(v.SITE), CONTACT);

const logo = (v, hauteur) => {
  const largeur = Math.round(hauteur * (v.LOGO_RATIO || 1));
  return `<img src="${esc(v.LOGO_SRC)}" alt="Finck &amp; Fisch" width="${largeur}" height="${hauteur}" style="display:block;width:${largeur}px;height:${hauteur}px;border:0;outline:none;text-decoration:none;">`;
};

/** Filet horizontal : une cellule de 1px, rendu fiable partout. */
const hairline = (width) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="${width}" height="1" bgcolor="${RULE}" style="width:${width}px;height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>`;

/* ---------- la signature ---------- */

/**
 * Hauteur du bloc texte, donc du logo : nom (24) + role (17) + filet et ses
 * marges (25) + trois lignes de coordonnees a 22 (66). Si on touche a une de
 * ces valeurs, il faut reprendre ce nombre, sinon le logo depasse du bloc.
 */
const HAUTEUR_BLOC = 132;

function signature(v) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${SANS};">
  <tr>
    <td valign="middle" style="padding:0 24px 0 0;">${logo(v, HAUTEUR_BLOC)}</td>
    <td width="1" bgcolor="${RULE}" style="width:1px;min-width:1px;line-height:1px;font-size:1px;">&nbsp;</td>
    <td valign="middle" style="padding:0 0 0 24px;">
      <div style="font-family:${SERIF};font-size:20px;line-height:24px;color:${INK};letter-spacing:0.2px;">${esc(v.NOM_COMPLET)}</div>
      <div style="font-size:10px;line-height:15px;color:${FAINT};letter-spacing:2.2px;text-transform:uppercase;padding-top:2px;white-space:nowrap;">${esc(v.ROLE)} &nbsp;/&nbsp; Finck &amp; Fisch</div>
      <div style="padding:12px 0;">${hairline(200)}</div>
      <div style="font-family:${SERIF};font-size:13px;line-height:22px;color:${CONTACT};letter-spacing:0.3px;">
        ${mail(v)}<br>
        ${tel(v)}<br>
        ${site(v)}
      </div>
    </td>
  </tr>
</table>`;
}

/* ---------- version texte ---------- */

export function plain(raw) {
  const v = normalise(raw);
  return `--\n${v.NOM_COMPLET} | ${v.ROLE}\nFinck & Fisch - Digital Studio\n${v.EMAIL} | ${v.TELEPHONE}\n${v.SITE}`;
}

/* ---------- catalogue ---------- */

export const VARIANTS = [
  { id: 'signature', nom: 'Signature', note: '', render: signature }
];

export function build(id, raw) {
  const variante = VARIANTS.find((x) => x.id === id);
  if (!variante) throw new Error(`Variante inconnue : ${id}`);
  return variante.render(normalise(raw));
}
