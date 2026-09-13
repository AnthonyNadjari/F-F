#!/usr/bin/env bash
# Rasterise les SVG de brand/logo/export/ en PNG a fond transparent.
#
#   CHROME=/chemin/vers/chrome bash brand/logo/export_png.sh
#
# Les PNG servent la ou le SVG ne passe pas : signature email (Gmail supprime
# les SVG), favicons, icone iOS. Tout est exporte en x2 puis affiche a la
# moitie, pour rester net sur les ecrans Retina.
set -euo pipefail

ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SORTIE="$ICI/export"
CHROME="${CHROME:-$(command -v chromium || command -v google-chrome || echo /opt/pw-browsers/chromium-1194/chrome-linux/chrome)}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Chrome refuse les fenetres de moins d'une centaine de pixels et rend une
# image vide : sous ce seuil on dessine en grand et on reduit a la capture.
rasterise() {  # <svg> <largeur> <hauteur> <sortie>
  local svg="$1" w="$2" h="$3" out="$4" facteur=1 fw="$2" fh="$3"
  while (( fw < 200 || fh < 200 )); do
    facteur=$(( facteur * 2 )); fw=$(( w * facteur )); fh=$(( h * facteur ))
  done
  cat > "$TMP/page.html" <<HTML
<body style="margin:0;width:${fw}px;height:${fh}px;display:flex;align-items:center;justify-content:center;">
<img src="file://$SORTIE/$svg" style="width:100%;height:100%;object-fit:contain;">
</body>
HTML
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --default-background-color=00000000 \
    --force-device-scale-factor="$(awk "BEGIN{print 1/$facteur}")" \
    --screenshot="$SORTIE/$out" --window-size="$fw,$fh" \
    "file://$TMP/page.html" >/dev/null 2>&1
  echo "  ok  export/$out  (${w}x${h})"
}

# Signature email : monogramme seul, deux densites
rasterise monogram.svg        240 200 "monogram@2x.png"
rasterise monogram.svg        120 100 "monogram.png"
rasterise monogram-blanc.svg  240 200 "monogram-blanc@2x.png"

# En-tetes : verrouillage horizontal
rasterise logo-horizontal.svg        640 160 "logo-horizontal@2x.png"
rasterise logo-horizontal-blanc.svg  640 160 "logo-horizontal-blanc@2x.png"

# Navigateur et iOS : monogramme cadre serre, carre
rasterise monogram-carre.svg  512 512 "favicon-512.png"
rasterise monogram-carre.svg  180 180 "apple-touch-icon.png"
rasterise monogram-carre.svg   32  32 "favicon-32.png"

# Monogramme embarque : les signatures email en ont besoin en base64, pour que
# l'image parte avec le copier-coller sans dependre d'un hebergement.
python3 - "$SORTIE/monogram@2x.png" "$ICI/../signature/logo-embed.mjs" <<'PY'
import base64, pathlib, struct, sys

source, sortie = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
octets = source.read_bytes()
largeur, hauteur = struct.unpack('>II', octets[16:24])  # en-tete IHDR d'un PNG
b64 = base64.b64encode(octets).decode('ascii')

sortie.write_text(
    '/**\n'
    ' * Monogramme Finck & Fisch, embarque en base64.\n'
    ' *\n'
    ' * Genere par brand/logo/export_png.sh depuis brand/logo/export/monogram@2x.png\n'
    ' * -- ne pas editer a la main. Les signatures s en servent pour que le logo\n'
    ' * parte avec le copier-coller : Gmail reheberge l image au collage, donc ni\n'
    ' * domaine ni hebergement ne sont necessaires.\n'
    ' */\n\n'
    'export const MONOGRAMME = {\n'
    f"  src: 'data:image/png;base64,{b64}',\n"
    f'  ratio: {largeur / hauteur:.4f},\n'
    f'  taille: [{largeur}, {hauteur}]\n'
    '};\n',
    encoding='utf-8'
)
print(f'  ok  brand/signature/logo-embed.mjs  ({len(b64) // 1024} Ko, {largeur}x{hauteur})')
PY
