#!/bin/bash
# ============================================================
# TourCity — Добавление SVG-иконки для категории
# ============================================================
# Использование:
#   ./add_category_icon.sh <категория> <путь_к_файлу.svg>
#
# Пример:
#   ./add_category_icon.sh restaurant ~/Desktop/restaurant.svg
#   ./add_category_icon.sh beach ~/Desktop/wave.svg
#
# Доступные категории:
#   beach  restaurant  cafe  hotel  temple  museum
#   shopping  nightlife  nature  entertainment
#   transport  medical  service  sight
# ============================================================

set -e

CATEGORY="$1"
SVG_SOURCE="$2"
ASSETS_DIR="/Users/rch/tourcity.info/TourCity/Resources/Assets.xcassets"

# ── Цвета для вывода ──
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

VALID_CATEGORIES="beach restaurant cafe hotel temple museum shopping nightlife nature entertainment transport medical service sight fastfood"

# ── Проверки ──────────────────────────────────────────────────
if [ -z "$CATEGORY" ] || [ -z "$SVG_SOURCE" ]; then
    echo -e "${RED}❌ Использование: ./add_category_icon.sh <категория> <путь_к_svg>${NC}"
    echo ""
    echo "Доступные категории:"
    echo "  beach  restaurant  cafe  hotel  temple  museum"
    echo "  shopping  nightlife  nature  entertainment"
    echo "  transport  medical  service  sight"
    exit 1
fi

if [[ ! " $VALID_CATEGORIES " =~ " $CATEGORY " ]]; then
    echo -e "${RED}❌ Неизвестная категория: '$CATEGORY'${NC}"
    echo "Доступные: $VALID_CATEGORIES"
    exit 1
fi

SVG_SOURCE="${SVG_SOURCE/#\~/$HOME}"  # Раскрываем ~

if [ ! -f "$SVG_SOURCE" ]; then
    echo -e "${RED}❌ Файл не найден: $SVG_SOURCE${NC}"
    exit 1
fi

EXT="${SVG_SOURCE##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
if [[ "$EXT_LOWER" != "svg" ]]; then
    echo -e "${YELLOW}⚠️  Ожидается SVG файл, получен: .$EXT${NC}"
    echo "Продолжаю..."
fi

IMAGESET_DIR="$ASSETS_DIR/cat_${CATEGORY}.imageset"
if [ ! -d "$IMAGESET_DIR" ]; then
    echo -e "${RED}❌ Папка не найдена: $IMAGESET_DIR${NC}"
    echo "Попробуй пересоздать структуру: cd проект && bash tourcity-admin/scripts/setup_icons.sh"
    exit 1
fi

# ── Конвертация SVG → PDF ──────────────────────────────────────
echo -e "${BLUE}🔄 Конвертирую SVG → PDF...${NC}"

PDF_DEST="$IMAGESET_DIR/cat_${CATEGORY}.pdf"

# Пробуем разные конвертеры
CONVERTED=false

# 1. rsvg-convert (librsvg, установлен через Homebrew)
RSVG=$(command -v rsvg-convert 2>/dev/null || echo "/opt/homebrew/bin/rsvg-convert")
if [ -x "$RSVG" ]; then
    "$RSVG" -f pdf -o "$PDF_DEST" "$SVG_SOURCE"
    CONVERTED=true
    echo -e "${GREEN}  ✅ rsvg-convert${NC}"

# 2. cairosvg (Python) — если есть нативная cairо
elif /usr/bin/python3 -c "import cairosvg" 2>/dev/null; then
    /usr/bin/python3 -c "import cairosvg; cairosvg.svg2pdf(url='$SVG_SOURCE', write_to='$PDF_DEST')"
    CONVERTED=true
    echo -e "${GREEN}  ✅ cairosvg${NC}"

# 3. Inkscape
elif command -v inkscape &> /dev/null; then
    inkscape "$SVG_SOURCE" --export-pdf="$PDF_DEST" 2>/dev/null
    CONVERTED=true
    echo -e "${GREEN}  ✅ Inkscape${NC}"

# 4. macOS qlmanage (ограниченная поддержка SVG)
elif command -v qlmanage &> /dev/null; then
    TMPDIR_CONV=$(mktemp -d)
    qlmanage -t -s 512 -o "$TMPDIR_CONV" "$SVG_SOURCE" 2>/dev/null
    PNG_RESULT=$(ls "$TMPDIR_CONV"/*.png 2>/dev/null | head -1)
    if [ -f "$PNG_RESULT" ]; then
        cp "$PNG_RESULT" "$IMAGESET_DIR/cat_${CATEGORY}.png"
        rm -rf "$TMPDIR_CONV"
        CONVERTED=true
        USE_PNG=true
        echo -e "${YELLOW}  ⚠️  qlmanage (PNG, не PDF)${NC}"
    fi

else
    echo -e "${YELLOW}⚠️  Конвертер не найден. Устанавливаю librsvg...${NC}"
    if command -v brew &> /dev/null; then
        brew install librsvg
        rsvg-convert -f pdf -o "$PDF_DEST" "$SVG_SOURCE"
        CONVERTED=true
        echo -e "${GREEN}  ✅ librsvg установлен и конвертирован${NC}"
    else
        echo -e "${RED}❌ Homebrew не найден. Установи вручную:${NC}"
        echo "   brew install librsvg"
        echo "   Затем перезапусти скрипт."
        exit 1
    fi
fi

if [ "$CONVERTED" = false ]; then
    echo -e "${RED}❌ Не удалось конвертировать SVG${NC}"
    exit 1
fi

# ── Обновляем Contents.json ───────────────────────────────────
if [ "${USE_PNG}" = true ]; then
    # PNG вариант
    cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "cat_${CATEGORY}.png",
      "idiom" : "universal",
      "scale" : "1x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSONEOF
else
    # PDF вариант (рекомендуется)
    cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "cat_${CATEGORY}.pdf",
      "idiom" : "universal",
      "scale" : "1x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  },
  "properties" : {
    "preserves-vector-representation" : true,
    "template-rendering-intent" : "template"
  }
}
JSONEOF
fi

# ── Итог ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Иконка для категории '$CATEGORY' добавлена!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📁 Ассет:   ${BLUE}cat_${CATEGORY}.imageset/${NC}"
if [ "${USE_PNG}" = true ]; then
    echo -e "📄 Файл:    ${BLUE}cat_${CATEGORY}.png${NC}"
else
    echo -e "📄 Файл:    ${BLUE}cat_${CATEGORY}.pdf${NC} (конвертировано из SVG)"
fi
echo ""
echo -e "${YELLOW}➡️  Следующий шаг: пересобери проект в Xcode (Cmd+B)${NC}"
echo ""
