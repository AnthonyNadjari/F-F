/**
 * Signatures email Finck & Fisch — source unique.
 *
 * Ce fichier est utilise a la fois par build.mjs (generation en ligne de
 * commande) et par generateur.html (page de copie). Une composition modifiee
 * ici l'est partout : ne pas dupliquer le HTML ailleurs.
 *
 * Contraintes des clients mail, valables pour tout ce qui suit :
 * tableaux uniquement (Outlook Windows rend le HTML avec le moteur de Word),
 * styles inline uniquement, polices systeme uniquement, filets en cellules de
 * 1px avec bgcolor plutot qu'en border, couleur forcee sur le <a> ET sur un
 * <span> interieur sinon iOS repasse les liens en bleu.
 */

const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = 'Arial,Helvetica,sans-serif';

const INK = '#111111';
const SOFT = '#6F6A63';
const RULE = '#DCD7D0';
const FAINT = '#A39C93';
const PAPER = '#FFFFFF';

export const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Deduit les champs calcules (lien tel:, URL du site) des champs saisis. */
export function normalise(raw) {
  const v = { ...raw };
  v.TELEPHONE = (v.TELEPHONE || '').trim();
  v.TEL_BRUT = v.TELEPHONE.replace(/[^\d+]/g, '');
  const bare = (v.SITE || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  v.SITE = bare;
  v.SITE_URL = bare ? 'https://' + bare : '';
  return v;
}

/* ---------- fragments partages ---------- */

const a = (href, label, color) =>
  `<a href="${href}" style="color:${color};text-decoration:none;"><span style="color:${color};text-decoration:none;">${label}</span></a>`;

const mail = (v, color) => a('mailto:' + esc(v.EMAIL), esc(v.EMAIL), color);
const tel = (v, color) => a('tel:' + esc(v.TEL_BRUT), esc(v.TELEPHONE), color);
const site = (v, color) => a(esc(v.SITE_URL), esc(v.SITE), color);

/** Le nom du studio, avec l'esperluette en italique — le detail du logo. */
const wordmark = ({ size = 13, color = INK, track = 3, weight = 'normal' } = {}) =>
  `<span style="font-family:${SERIF};font-size:${size}px;line-height:${Math.round(size * 1.3)}px;font-weight:${weight};color:${color};letter-spacing:${track}px;text-transform:uppercase;">FINCK <i style="font-style:italic;">&amp;</i> FISCH</span>`;

/** Filet horizontal : une cellule de 1px, rendu fiable partout. */
const hairline = (width, color = RULE, align = 'left') =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="border-collapse:collapse;${align === 'center' ? 'margin:0 auto;' : ''}"><tr><td width="${width}" height="1" bgcolor="${color}" style="width:${width}px;height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>`;

const dot = (color) => `<span style="color:${color};">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`;

const open = (extra = '') =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${SANS};${extra}">`;

/* ---------- compositions ---------- */

/**
 * A — Filet
 * Le nom en grand serif bas-de-casse, un filet court, les coordonnees
 * empilees. Le contraste d'echelle fait le travail.
 */
function filet(v) {
  return `${open()}
  <tr>
    <td style="padding:0 0 2px 0;font-family:${SERIF};font-size:20px;line-height:24px;color:${INK};letter-spacing:0.2px;">${esc(v.NOM_COMPLET)}</td>
  </tr>
  <tr>
    <td style="padding:0 0 12px 0;font-size:10px;line-height:15px;color:${FAINT};letter-spacing:2.2px;text-transform:uppercase;">${esc(v.ROLE)} &nbsp;/&nbsp; Finck &amp; Fisch</td>
  </tr>
  <tr><td style="padding:0 0 12px 0;">${hairline(200)}</td></tr>
  <tr>
    <td style="font-size:12px;line-height:20px;color:${INK};">
      ${mail(v, INK)}<br>
      ${tel(v, INK)}<br>
      ${site(v, INK)}
    </td>
  </tr>
</table>`;
}

/**
 * B — Colonnes
 * Identite a gauche, coordonnees a droite, filet vertical entre les deux.
 * Compact en hauteur, utile quand la signature suit un mail long.
 */
function colonnes(v) {
  return `${open()}
  <tr>
    <td valign="top" style="padding:0 22px 0 0;">
      <div style="font-family:${SERIF};font-size:15px;line-height:20px;color:${INK};letter-spacing:1.4px;text-transform:uppercase;">${esc(v.NOM_COMPLET)}</div>
      <div style="font-size:11px;line-height:17px;color:${SOFT};padding-top:3px;">${esc(v.ROLE)}</div>
      <div style="padding-top:10px;">${wordmark({ size: 11, track: 2.4 })}</div>
    </td>
    <td width="1" bgcolor="${RULE}" style="width:1px;min-width:1px;line-height:1px;font-size:1px;">&nbsp;</td>
    <td valign="top" style="padding:2px 0 0 22px;font-size:12px;line-height:20px;color:${INK};">
      ${mail(v, INK)}<br>
      ${tel(v, INK)}<br>
      ${site(v, INK)}
    </td>
  </tr>
</table>`;
}

/**
 * C — Bandeau
 * Le nom du studio en reserve sur un bandeau noir. C'est la plus affirmee :
 * a garder pour les premiers contacts et les propositions commerciales.
 */
function bandeau(v) {
  return `${open()}
  <tr>
    <td bgcolor="${INK}" style="background-color:${INK};padding:11px 18px;">${wordmark({ size: 13, color: PAPER, track: 3.4 })}</td>
  </tr>
  <tr>
    <td style="padding:14px 0 0 0;font-family:${SERIF};font-size:15px;line-height:20px;color:${INK};letter-spacing:0.2px;">
      ${esc(v.NOM_COMPLET)}<span style="color:${FAINT};">&nbsp;&nbsp;—&nbsp;&nbsp;</span><span style="font-family:${SANS};font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${SOFT};">${esc(v.ROLE)}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0 0 0;font-size:12px;line-height:19px;color:${INK};">
      ${mail(v, INK)}${dot(FAINT)}${tel(v, INK)}${dot(FAINT)}${site(v, INK)}
    </td>
  </tr>
</table>`;
}

/**
 * D — Centree
 * Composition symetrique, filet court au centre. La plus sobre, celle qui
 * passe le mieux sous un mail court.
 */
function centree(v) {
  return `${open('text-align:center;')}
  <tr><td align="center" style="padding:0 0 10px 0;">${wordmark({ size: 12, track: 3.4 })}</td></tr>
  <tr><td align="center" style="padding:0 0 11px 0;">${hairline(34, RULE, 'center')}</td></tr>
  <tr>
    <td align="center" style="font-size:11px;line-height:16px;color:${INK};letter-spacing:2px;text-transform:uppercase;">${esc(v.NOM_COMPLET)}</td>
  </tr>
  <tr>
    <td align="center" style="padding:3px 0 11px 0;font-family:${SERIF};font-style:italic;font-size:12px;line-height:17px;color:${SOFT};">${esc(v.ROLE)}</td>
  </tr>
  <tr>
    <td align="center" style="font-size:11px;line-height:18px;color:${SOFT};">
      ${mail(v, SOFT)}${dot(RULE)}${tel(v, SOFT)}${dot(RULE)}${site(v, SOFT)}
    </td>
  </tr>
</table>`;
}

/**
 * E — Bornes
 * Le bloc tenu entre deux filets pleine largeur. Lisible meme quand le client
 * mail ecrase les marges du fil de discussion.
 */
function bornes(v) {
  return `${open('width:340px;')}
  <tr><td>${hairline(340, '#111111')}</td></tr>
  <tr>
    <td style="padding:13px 0 0 0;font-family:${SERIF};font-size:16px;line-height:21px;color:${INK};letter-spacing:0.2px;">${esc(v.NOM_COMPLET)}</td>
  </tr>
  <tr>
    <td style="padding:2px 0 11px 0;font-size:10px;line-height:15px;color:${FAINT};letter-spacing:2.2px;text-transform:uppercase;">${esc(v.ROLE)}</td>
  </tr>
  <tr>
    <td style="padding:0 0 13px 0;font-size:12px;line-height:19px;color:${INK};">
      ${mail(v, INK)}<br>
      ${tel(v, INK)}${dot(RULE)}${site(v, INK)}
    </td>
  </tr>
  <tr><td>${hairline(340)}</td></tr>
  <tr>
    <td style="padding:9px 0 0 0;">${wordmark({ size: 10, color: FAINT, track: 3 })}</td>
  </tr>
</table>`;
}

/**
 * F — Fiche
 * Les coordonnees en colonne etiquetee, comme une fiche technique. Le plus
 * lisible quand il y a beaucoup d'informations a donner.
 */
function fiche(v) {
  const ligne = (label, valeur) => `
  <tr>
    <td valign="top" width="26" style="width:26px;padding:0 0 5px 0;font-size:9px;line-height:18px;color:${FAINT};letter-spacing:1.6px;">${label}</td>
    <td valign="top" style="padding:0 0 5px 0;font-size:12px;line-height:18px;color:${INK};">${valeur}</td>
  </tr>`;

  return `${open()}
  <tr>
    <td colspan="2" style="padding:0 0 1px 0;font-family:${SERIF};font-size:17px;line-height:22px;color:${INK};letter-spacing:0.2px;">${esc(v.NOM_COMPLET)}</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:0 0 14px 0;font-size:11px;line-height:17px;color:${SOFT};">${esc(v.ROLE)}, ${wordmark({ size: 11, color: SOFT, track: 2 })}</td>
  </tr>
  ${ligne('E', mail(v, INK))}
  ${ligne('T', tel(v, INK))}
  ${ligne('W', site(v, INK))}
</table>`;
}

/**
 * G — Compacte
 * Deux lignes, pour les reponses dans un fil deja long. A regler comme
 * signature de reponse dans Gmail, la premiere restant pour les nouveaux mails.
 */
function compacte(v) {
  return `${open()}
  <tr><td>${hairline(260)}</td></tr>
  <tr>
    <td style="padding:9px 0 0 0;font-family:${SERIF};font-size:13px;line-height:18px;color:${INK};letter-spacing:1.2px;text-transform:uppercase;">${esc(v.NOM_COMPLET)}${dot(FAINT)}${wordmark({ size: 12, track: 1.6 })}</td>
  </tr>
  <tr>
    <td style="padding:4px 0 0 0;font-size:11px;line-height:17px;color:${SOFT};">
      ${mail(v, SOFT)}${dot(RULE)}${tel(v, SOFT)}${dot(RULE)}${site(v, SOFT)}
    </td>
  </tr>
</table>`;
}

/**
 * H — Logo
 * Le vrai logo en tete, centre. Ne fonctionne qu'une fois le PNG heberge en
 * https a une URL stable : voir brand/logo/README.md.
 */
function logo(v) {
  return `${open('text-align:center;')}
  <tr>
    <td align="center" style="padding:0 0 12px 0;">
      <img src="${esc(v.LOGO_URL)}" alt="Finck &amp; Fisch" width="132" height="44" style="display:block;margin:0 auto;width:132px;height:44px;border:0;outline:none;text-decoration:none;">
    </td>
  </tr>
  <tr><td align="center" style="padding:0 0 12px 0;">${hairline(34, RULE, 'center')}</td></tr>
  <tr>
    <td align="center" style="font-size:11px;line-height:16px;color:${INK};letter-spacing:2px;text-transform:uppercase;">${esc(v.NOM_COMPLET)}</td>
  </tr>
  <tr>
    <td align="center" style="padding:3px 0 11px 0;font-family:${SERIF};font-style:italic;font-size:12px;line-height:17px;color:${SOFT};">${esc(v.ROLE)}</td>
  </tr>
  <tr>
    <td align="center" style="font-size:11px;line-height:18px;color:${SOFT};">
      ${mail(v, SOFT)}${dot(RULE)}${tel(v, SOFT)}${dot(RULE)}${site(v, SOFT)}
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
  {
    id: 'filet',
    nom: 'Filet',
    note: 'Nom en grand serif, filet court, coordonnees empilees. Le choix par defaut.',
    render: filet
  },
  {
    id: 'colonnes',
    nom: 'Colonnes',
    note: 'Identite a gauche, coordonnees a droite. Compact en hauteur.',
    render: colonnes
  },
  {
    id: 'bandeau',
    nom: 'Bandeau',
    note: 'Nom du studio en reserve sur noir. La plus affirmee, pour les premiers contacts.',
    render: bandeau
  },
  {
    id: 'centree',
    nom: 'Centree',
    note: 'Composition symetrique et sobre, pour les mails courts.',
    render: centree
  },
  {
    id: 'bornes',
    nom: 'Bornes',
    note: 'Bloc tenu entre deux filets. Tient bon quand le client mail ecrase les marges.',
    render: bornes
  },
  {
    id: 'fiche',
    nom: 'Fiche',
    note: 'Coordonnees etiquetees E / T / W, comme une fiche technique.',
    render: fiche
  },
  {
    id: 'compacte',
    nom: 'Compacte',
    note: 'Deux lignes, a regler comme signature de reponse.',
    render: compacte
  },
  {
    id: 'logo',
    nom: 'Logo',
    note: 'Le vrai logo en tete. Necessite le PNG heberge en https.',
    render: logo,
    besoinLogo: true
  }
];

export function build(id, raw) {
  const variante = VARIANTS.find((x) => x.id === id);
  if (!variante) throw new Error(`Variante inconnue : ${id}`);
  return variante.render(normalise(raw));
}
