#!/usr/bin/env python3
"""
Reconstruit le logo Finck & Fisch en vectoriel.

    pip install fonttools
    python3 brand/logo/build_logo.py --fonts <dossier des .ttf>

Le logo est un Didone : monogramme F&F entrelace, nom en capitales espacees,
baseline en dessous. Le script reprend cette composition a partir de Bodoni
Moda, convertit chaque lettre en courbes et ecrit des SVG autonomes : plus
aucune dependance a une police une fois genere, et le fichier se redimensionne
sans perte.

Tout est cadre sur la boite d'encre reelle des contours, jamais sur la hauteur
de capitale ou la chasse : un F deborde de sa chasse et une esperluette
italique descend sous la ligne de base, donc ces valeurs-la rognent le dessin.

Les fichiers de police ne sont pas versionnes (licence OFL, ils se
retelechargent) : le script les prend dans --fonts, par defaut a cote de lui.

Sortie dans brand/logo/ :
    source/logo-master.svg      composition complete
    export/logo-horizontal.svg  monogramme a gauche, nom a droite
    export/monogram.svg         monogramme seul
    export/*-blanc.svg          les memes en blanc, pour fonds sombres
"""

import argparse
import pathlib
from dataclasses import dataclass

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

# ---------------------------------------------------------------- reglages

UPM = 2000  # unites par em de Bodoni Moda

# Monogramme : pose de chaque signe, en unites de police.
# x vers la droite, y vers le haut, k = echelle du signe.
# Regle par comparaison visuelle : assez serre pour s'entrelacer, assez
# ouvert pour que les deux F restent lisibles a 44 px de haut.
MONOGRAMME = (
    ('F', 'romain', 0, 0, 1.00),
    ('&', 'italique', 560, -320, 0.92),
    ('F', 'romain', 1070, -170, 1.00),
)

NOM = 'FINCK & FISCH'
NOM_TRACKING = 0.20        # en em
BASELINE = 'DIGITAL STUDIO'
BASELINE_TRACKING = 0.42

ENCRE = '#111111'
BLANC = '#FFFFFF'

# ------------------------------------------------------------------ outils


@dataclass
class Dessin:
    """Des contours deja positionnes, en unites de police (y vers le haut)."""

    paths: list
    bbox: tuple  # (x0, y0, x1, y1) de l'encre reelle

    @property
    def largeur(self):
        return self.bbox[2] - self.bbox[0]

    @property
    def hauteur(self):
        return self.bbox[3] - self.bbox[1]


def charger(dossier):
    return (
        TTFont(dossier / 'BodoniModa-Regular.ttf'),
        TTFont(dossier / 'BodoniModa-Italic.ttf'),
    )


def contours(font, caractere, transform):
    """Path SVG et boite d'encre d'un caractere, une fois transforme."""
    nom = font.getBestCmap().get(ord(caractere))
    if nom is None:
        raise SystemExit(f'Caractere absent de la police : {caractere!r}')
    jeu = font.getGlyphSet()

    plume = SVGPathPen(jeu)
    jeu[nom].draw(TransformPen(plume, transform))

    limites = BoundsPen(jeu)
    jeu[nom].draw(TransformPen(limites, transform))

    return plume.getCommands(), limites.bounds, jeu[nom].width


def union(boites):
    boites = [b for b in boites if b]
    if not boites:
        raise SystemExit('Dessin vide')
    return (
        min(b[0] for b in boites), min(b[1] for b in boites),
        max(b[2] for b in boites), max(b[3] for b in boites),
    )


def dessin_ligne(font, texte, tracking_em, italique_pour=None):
    """Une ligne composee lettre par lettre, pour espacer les capitales."""
    paths, boites = [], []
    x = 0.0
    tracking = tracking_em * UPM
    for c in texte:
        if c == ' ':
            x += UPM * 0.22 + tracking
            continue
        source = italique_pour if (italique_pour and c == '&') else font
        path, boite, avance = contours(source, c, Transform().translate(x, 0))
        if path:
            paths.append(path)
            boites.append(boite)
        x += avance + tracking
    return Dessin(paths, union(boites))


def dessin_monogramme(romain, italique):
    """Le F&F entrelace : deux F romains et une esperluette italique entre eux."""
    polices = {'romain': romain, 'italique': italique}
    paths, boites = [], []
    for caractere, police, x, y, k in MONOGRAMME:
        transform = Transform().translate(x, y).scale(k)
        path, boite, _ = contours(polices[police], caractere, transform)
        paths.append(path)
        boites.append(boite)
    return Dessin(paths, union(boites))


def poser(dessin, echelle, x_gauche, y_haut):
    """
    Place un dessin dans le repere SVG (y vers le bas) : son encre commence
    exactement a (x_gauche, y_haut), sans marge parasite ni rognage.
    """
    x0, _, _, y1 = dessin.bbox
    tx = x_gauche - echelle * x0
    ty = y_haut + echelle * y1
    corps = '\n'.join(f'    <path d="{d}"/>' for d in dessin.paths)
    return (
        f'  <g transform="translate({tx:.3f} {ty:.3f}) '
        f'scale({echelle:.6f} {-echelle:.6f})">\n{corps}\n  </g>'
    )


def document(contenu, largeur, hauteur, couleur, titre):
    titre = titre.replace('&', '&amp;')  # un SVG est du XML
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {largeur:.0f} {hauteur:.0f}" '
        f'width="{largeur:.0f}" height="{hauteur:.0f}" role="img" aria-label="{titre}">\n'
        f'  <title>{titre}</title>\n'
        f'  <g fill="{couleur}">\n{contenu}\n  </g>\n</svg>\n'
    )


# ------------------------------------------------------------ compositions


def composer_complet(romain, italique, couleur):
    """Monogramme centre, nom dessous, baseline en pied."""
    mono = dessin_monogramme(romain, italique)
    nom = dessin_ligne(romain, NOM, NOM_TRACKING, italique_pour=italique)
    base = dessin_ligne(romain, BASELINE, BASELINE_TRACKING)

    k_mono = 560.0 / mono.hauteur
    k_nom = 150.0 / nom.hauteur
    k_base = 42.0 / base.hauteur

    marge = 90.0
    ecart_mono_nom = 130.0
    ecart_nom_base = 62.0

    l_mono, h_mono = mono.largeur * k_mono, mono.hauteur * k_mono
    l_nom, h_nom = nom.largeur * k_nom, nom.hauteur * k_nom
    l_base, h_base = base.largeur * k_base, base.hauteur * k_base

    largeur = max(l_mono, l_nom, l_base) + 2 * marge
    hauteur = marge + h_mono + ecart_mono_nom + h_nom + ecart_nom_base + h_base + marge

    y = marge
    corps = [poser(mono, k_mono, (largeur - l_mono) / 2, y)]
    y += h_mono + ecart_mono_nom
    corps.append(poser(nom, k_nom, (largeur - l_nom) / 2, y))
    y += h_nom + ecart_nom_base
    corps.append(poser(base, k_base, (largeur - l_base) / 2, y))

    return document('\n'.join(corps), largeur, hauteur, couleur,
                    'Finck & Fisch — Digital Studio')


def composer_horizontal(romain, italique, couleur):
    """Monogramme a gauche, nom et baseline empiles a droite."""
    mono = dessin_monogramme(romain, italique)
    nom = dessin_ligne(romain, NOM, NOM_TRACKING, italique_pour=italique)
    base = dessin_ligne(romain, BASELINE, BASELINE_TRACKING)

    k_mono = 190.0 / mono.hauteur
    k_nom = 76.0 / nom.hauteur
    k_base = 22.0 / base.hauteur

    marge = 46.0
    gouttiere = 74.0
    ecart = 30.0

    l_mono, h_mono = mono.largeur * k_mono, mono.hauteur * k_mono
    l_nom, h_nom = nom.largeur * k_nom, nom.hauteur * k_nom
    l_base, h_base = base.largeur * k_base, base.hauteur * k_base

    h_droite = h_nom + ecart + h_base
    h_contenu = max(h_mono, h_droite)
    hauteur = h_contenu + 2 * marge
    largeur = marge + l_mono + gouttiere + max(l_nom, l_base) + marge

    x_droite = marge + l_mono + gouttiere
    y_nom = marge + (h_contenu - h_droite) / 2

    corps = [
        poser(mono, k_mono, marge, marge + (h_contenu - h_mono) / 2),
        poser(nom, k_nom, x_droite, y_nom),
        poser(base, k_base, x_droite, y_nom + h_nom + ecart),
    ]
    return document('\n'.join(corps), largeur, hauteur, couleur, 'Finck & Fisch')


def composer_monogramme(romain, italique, couleur, marge=44.0, carre=False):
    mono = dessin_monogramme(romain, italique)
    k = 420.0 / mono.hauteur
    l, h = mono.largeur * k, mono.hauteur * k

    if carre:
        largeur = hauteur = max(l, h) + 2 * marge
    else:
        largeur, hauteur = l + 2 * marge, h + 2 * marge

    corps = poser(mono, k, (largeur - l) / 2, (hauteur - h) / 2)
    return document(corps, largeur, hauteur, couleur, 'Finck & Fisch')


# -------------------------------------------------------------------- main


def main():
    ici = pathlib.Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument('--fonts', type=pathlib.Path, default=ici,
                        help='dossier contenant BodoniModa-Regular.ttf et -Italic.ttf')
    args = parser.parse_args()

    romain, italique = charger(args.fonts)
    (ici / 'source').mkdir(parents=True, exist_ok=True)
    (ici / 'export').mkdir(parents=True, exist_ok=True)

    sorties = [
        ('source/logo-master.svg', composer_complet(romain, italique, ENCRE)),
        ('export/logo-complet-blanc.svg', composer_complet(romain, italique, BLANC)),
        ('export/logo-horizontal.svg', composer_horizontal(romain, italique, ENCRE)),
        ('export/logo-horizontal-blanc.svg', composer_horizontal(romain, italique, BLANC)),
        ('export/monogram.svg', composer_monogramme(romain, italique, ENCRE)),
        ('export/monogram-blanc.svg', composer_monogramme(romain, italique, BLANC)),
        ('export/monogram-carre.svg', composer_monogramme(romain, italique, ENCRE, carre=True)),
    ]
    for nom, contenu in sorties:
        (ici / nom).write_text(contenu, encoding='utf-8')
        print(f'  ok  brand/logo/{nom}')


if __name__ == '__main__':
    main()
