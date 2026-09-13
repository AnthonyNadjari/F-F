#!/usr/bin/env python3
"""
Vectorise le logo Finck & Fisch a partir du fichier d'origine.

    pip install pillow && apt-get install potrace
    python3 brand/logo/vectorise.py

Le fichier d'origine est un PNG sur fond creme, sans transparence. Le script :

  1. detache l'encre du fond en calculant une couche alpha a partir de la
     luminosite, ce qui conserve l'anticrenelage des courbes du Didone ;
  2. decoupe le verrouillage en trois bandes (monogramme, nom, baseline) en
     cherchant les lignes vides, plutot qu'avec des coordonnees en dur ;
  3. trace les contours avec potrace pour obtenir de vraies courbes ;
  4. ecrit les SVG et les PNG a fond transparent dont on a besoin.

Tout part de brand/logo/source/ : ne jamais retoucher les fichiers de export/
a la main, ils sont regeneres.
"""

import argparse
import pathlib
import re
import subprocess
import tempfile

from PIL import Image

ENCRE = '#111111'
BLANC = '#FFFFFF'

# Une bande est un groupe de lignes qui contiennent de l'encre. On considere
# qu'on change de bande apres cette hauteur de vide, en fraction de l'image.
VIDE_ENTRE_BANDES = 0.012


# ------------------------------------------------------------ detourage


def couche_alpha(chemin):
    """
    Sépare l'encre du fond. Le fond est la valeur dominante des bords, l'encre
    la plus sombre : l'alpha interpole entre les deux, donc les bords des
    lettres restent lisses au lieu d'etre crenele par un seuil brutal.
    """
    gris = Image.open(chemin).convert('L')
    l, h = gris.size
    pixels = gris.load()

    bord = (
        [pixels[x, 0] for x in range(l)] + [pixels[x, h - 1] for x in range(l)] +
        [pixels[0, y] for y in range(h)] + [pixels[l - 1, y] for y in range(h)]
    )
    fond = max(set(bord), key=bord.count)
    encre = min(gris.tobytes())
    if fond - encre < 40:
        raise SystemExit('Contraste insuffisant entre le fond et l\'encre.')

    echelle = 255.0 / (fond - encre)
    plancher = 16  # le fichier d'origine a un grain : en dessous, c'est du fond
    alpha = gris.point(
        lambda v: 0 if (brut := (fond - v) * echelle) < plancher
        else max(0, min(255, int(brut)))
    )
    return alpha


def bandes(alpha, seuil=8):
    """Les groupes de lignes contenant de l'encre, du haut vers le bas."""
    l, h = alpha.size
    pixels = alpha.load()
    pleines = [any(pixels[x, y] > seuil for x in range(l)) for y in range(h)]

    trouvees, debut, vide = [], None, 0
    limite = int(h * VIDE_ENTRE_BANDES)
    for y, pleine in enumerate(pleines):
        if pleine:
            if debut is None:
                debut = y
            vide = 0
        elif debut is not None:
            vide += 1
            if vide > limite:
                trouvees.append((debut, y - vide))
                debut, vide = None, 0
    if debut is not None:
        trouvees.append((debut, h - 1))
    return trouvees


def rogner(alpha, haut=None, bas=None, marge=0):
    """Recadre sur l'encre, eventuellement limitee a une tranche verticale."""
    zone = alpha.crop((0, haut, alpha.width, bas)) if haut is not None else alpha
    boite = zone.getbbox()
    if boite is None:
        raise SystemExit('Tranche vide')
    x0, y0, x1, y1 = boite
    x0, y0 = max(0, x0 - marge), max(0, y0 - marge)
    x1, y1 = min(zone.width, x1 + marge), min(zone.height, y1 + marge)
    return zone.crop((x0, y0, x1, y1))


def png(alpha, couleur, chemin, hauteur=None, cote=None, marge=0.0):
    """
    Ecrit un PNG a fond transparent, encre coloree.
    `hauteur` cale la hauteur ; `cote` produit une icone carree de ce cote,
    dans laquelle le dessin est inscrit en entier.
    """
    image = alpha
    if cote:
        utile = max(1, round(cote * (1 - 2 * marge)))
        k = utile / max(image.size)
        image = image.resize(
            (max(1, round(image.width * k)), max(1, round(image.height * k))), Image.LANCZOS
        )
        fond = Image.new('L', (cote, cote), 0)
        fond.paste(image, ((cote - image.width) // 2, (cote - image.height) // 2))
        image = fond
    elif hauteur:
        largeur = max(1, round(image.width * hauteur / image.height))
        image = image.resize((largeur, hauteur), Image.LANCZOS)

    rgb = tuple(int(couleur[i:i + 2], 16) for i in (1, 3, 5))
    sortie = Image.new('RGBA', image.size, rgb + (0,))
    sortie.putalpha(image)
    sortie.save(chemin, optimize=True)
    print(f'  ok  {chemin.relative_to(chemin.parents[2])}  ({image.width}x{image.height})')


# ------------------------------------------------------------ vectorisation


def tracer(alpha, lissage=2):
    """
    Passe l'image dans potrace et renvoie (contenu SVG, largeur, hauteur).
    On agrandit avant de binariser : potrace ne travaille qu'en noir et blanc,
    et partir d'une image plus grande adoucit les courbes qu'il en tire.
    """
    # Inversion volontaire : en PBM c'est le NOIR qui est de l'encre, alors que
    # dans la couche alpha c'est le blanc. Sans ca, potrace trace le fond.
    grand = alpha.resize(
        (alpha.width * lissage, alpha.height * lissage), Image.LANCZOS
    ).point(lambda v: 0 if v > 128 else 255).convert('1')

    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        grand.save(tmp / 'in.pbm')
        subprocess.run(
            ['potrace', '--svg', '--turdsize', '4', '--alphamax', '1.0',
             '--opttolerance', '0.2', '-o', str(tmp / 'out.svg'), str(tmp / 'in.pbm')],
            check=True
        )
        svg = (tmp / 'out.svg').read_text()

    boite = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    largeur, hauteur = float(boite.group(1)), float(boite.group(2))
    corps = re.search(r'(<g [^>]*>.*?</g>)', svg, re.S).group(1)
    corps = re.sub(r'fill="[^"]*"', 'fill="currentColor"', corps)
    return corps, largeur, hauteur


def document(pieces, largeur, hauteur, couleur, titre):
    titre = titre.replace('&', '&amp;')
    corps = '\n'.join(pieces)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {largeur:.0f} {hauteur:.0f}" '
        f'width="{largeur:.0f}" height="{hauteur:.0f}" role="img" aria-label="{titre}">\n'
        f'  <title>{titre}</title>\n'
        f'  <g color="{couleur}">\n{corps}\n  </g>\n</svg>\n'
    )


def pose(corps, k, dx, dy):
    return f'    <g transform="translate({dx:.2f} {dy:.2f}) scale({k:.6f})">{corps}</g>'


def svg_simple(alpha, couleur, titre, marge_ratio=0.06):
    corps, l, h = tracer(alpha)
    marge = max(l, h) * marge_ratio
    return document([pose(corps, 1, marge, marge)], l + 2 * marge, h + 2 * marge,
                    couleur, titre)


def svg_horizontal(mono, texte, couleur):
    """Monogramme a gauche, bloc nom + baseline a droite, centres l'un sur l'autre."""
    c_mono, l_mono, h_mono = tracer(mono)
    c_texte, l_texte, h_texte = tracer(texte)

    hauteur_mono = 190.0
    k_mono = hauteur_mono / h_mono
    hauteur_texte = 96.0
    k_texte = hauteur_texte / h_texte

    marge, gouttiere = 46.0, 78.0
    L_mono, L_texte = l_mono * k_mono, l_texte * k_texte
    h_contenu = max(hauteur_mono, hauteur_texte)

    largeur = marge + L_mono + gouttiere + L_texte + marge
    hauteur = h_contenu + 2 * marge

    pieces = [
        pose(c_mono, k_mono, marge, marge + (h_contenu - hauteur_mono) / 2),
        pose(c_texte, k_texte, marge + L_mono + gouttiere,
             marge + (h_contenu - hauteur_texte) / 2),
    ]
    return document(pieces, largeur, hauteur, couleur, 'Finck & Fisch')


def embarquer(source, sortie):
    """
    Ecrit le monogramme en base64 pour les signatures email : l'image part
    avec le copier-coller, donc elle s'affiche sans hebergement (Gmail la
    reheberge au collage).
    """
    import base64
    import struct

    octets = source.read_bytes()
    largeur, hauteur = struct.unpack('>II', octets[16:24])  # en-tete IHDR
    b64 = base64.b64encode(octets).decode('ascii')
    sortie = sortie.resolve()

    sortie.write_text(
        '/**\n'
        ' * Monogramme Finck & Fisch, embarque en base64.\n'
        ' *\n'
        ' * Genere par brand/logo/vectorise.py depuis le logo d\'origine.\n'
        ' * Ne pas editer a la main.\n'
        ' */\n\n'
        'export const MONOGRAMME = {\n'
        f"  src: 'data:image/png;base64,{b64}',\n"
        f'  ratio: {largeur / hauteur:.4f}\n'
        '};\n',
        encoding='utf-8'
    )
    print(f'  ok  brand/signature/logo-embed.mjs  ({len(b64) // 1024} Ko, {largeur}x{hauteur})')


# -------------------------------------------------------------------- main


def main():
    ici = pathlib.Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=pathlib.Path,
                        default=ici / 'source/f_and_f_logo.png')
    args = parser.parse_args()

    if not args.source.exists():
        raise SystemExit(f'Fichier d\'origine introuvable : {args.source}')

    (ici / 'export').mkdir(parents=True, exist_ok=True)
    alpha = couche_alpha(args.source)

    tranches = bandes(alpha)
    if len(tranches) != 3:
        raise SystemExit(
            f'{len(tranches)} bande(s) detectee(s) au lieu de 3 '
            '(monogramme, nom, baseline) : verifier le fichier d\'origine.'
        )
    (mono_haut, mono_bas), (nom_haut, _), (_, base_bas) = tranches

    complet = rogner(alpha)
    monogramme = rogner(alpha, mono_haut, mono_bas)
    texte = rogner(alpha, nom_haut, base_bas)

    print('Vectorisation')
    for nom, image, titre in (
        ('source/logo-master.svg', complet, 'Finck & Fisch — Digital Studio'),
        ('export/monogram.svg', monogramme, 'Finck & Fisch'),
    ):
        (ici / nom).write_text(svg_simple(image, ENCRE, titre), encoding='utf-8')
        print(f'  ok  brand/logo/{nom}')

    for nom, image, titre, couleur in (
        ('export/logo-complet-blanc.svg', complet, 'Finck & Fisch — Digital Studio', BLANC),
        ('export/monogram-blanc.svg', monogramme, 'Finck & Fisch', BLANC),
    ):
        (ici / nom).write_text(svg_simple(image, couleur, titre), encoding='utf-8')
        print(f'  ok  brand/logo/{nom}')

    for nom, couleur in (('export/logo-horizontal.svg', ENCRE),
                         ('export/logo-horizontal-blanc.svg', BLANC)):
        (ici / nom).write_text(svg_horizontal(monogramme, texte, couleur), encoding='utf-8')
        print(f'  ok  brand/logo/{nom}')

    print('Rasterisation')
    sortie = ici / 'export'
    png(monogramme, ENCRE, sortie / 'monogram@2x.png', hauteur=240)
    png(monogramme, ENCRE, sortie / 'monogram.png', hauteur=120)
    png(monogramme, BLANC, sortie / 'monogram-blanc@2x.png', hauteur=240)
    png(complet, ENCRE, sortie / 'logo-complet@2x.png', hauteur=560)
    png(complet, BLANC, sortie / 'logo-complet-blanc@2x.png', hauteur=560)
    png(monogramme, ENCRE, sortie / 'favicon-512.png', cote=512, marge=0.10)
    png(monogramme, ENCRE, sortie / 'apple-touch-icon.png', cote=180, marge=0.10)
    png(monogramme, ENCRE, sortie / 'favicon-32.png', cote=32, marge=0.06)

    embarquer(sortie / 'monogram@2x.png', ici / '../signature/logo-embed.mjs')


if __name__ == '__main__':
    main()
