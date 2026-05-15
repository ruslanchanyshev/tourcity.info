#!/bin/bash
# ============================================================
# TourCity — Авто-обработка всех иконок из папки
# ============================================================
set -e

INPUT_DIR="/Users/rch/tourcity.info/tourcity-admin/icons_input"
ASSETS_DIR="/Users/rch/tourcity.info/TourCity/Resources/Assets.xcassets"
CAT_SCRIPT="/Users/rch/tourcity.info/tourcity-admin/scripts/add_category_icon.sh"
RSVG=$(command -v rsvg-convert 2>/dev/null || echo "/opt/homebrew/bin/rsvg-convert")

# Цвета
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'

VALID_CATEGORIES=" beach restaurant cafe hotel temple museum shopping nightlife nature entertainment transport medical service sight fastfood "

mkdir -p "$ASSETS_DIR/POILogos"

echo -e "${BLUE}🔍 Начинаем обработку файлов из $INPUT_DIR...${NC}"

for file in "$INPUT_DIR"/*; do
    [ -f "$file" ] || continue
    
    filename=$(basename "$file")
    basename="${filename%.*}"
    extension="${filename##*.}"
    ext_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    
    # Проверяем, категория это или кастомный логотип
    if [[ "$VALID_CATEGORIES" =~ " $basename " ]]; then
        echo -e "\n⭐ Обработка базовой категории: ${YELLOW}$basename${NC}"
        bash "$CAT_SCRIPT" "$basename" "$file"
    else
        echo -e "\n🏢 Обработка кастомного логотипа бренда: ${YELLOW}$basename${NC}"
        
        IMAGESET_DIR="$ASSETS_DIR/POILogos/${basename}.imageset"
        mkdir -p "$IMAGESET_DIR"
        
        if [ "$ext_lower" == "svg" ]; then
            PDF_DEST="$IMAGESET_DIR/${basename}.pdf"
            if [ -x "$RSVG" ]; then
                "$RSVG" -f pdf -o "$PDF_DEST" "$file"
                cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "${basename}.pdf",
      "idiom" : "universal",
      "scale" : "1x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  },
  "properties" : {
    "preserves-vector-representation" : true
  }
}
JSONEOF
                echo -e "${GREEN}  ✅ Сконвертирован в PDF и добавлен в POILogos${NC}"
            else
                echo "Ошибка: rsvg-convert не найден"
                exit 1
            fi
        else
            # PNG или другие
            cp "$file" "$IMAGESET_DIR/${basename}.${ext_lower}"
            cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "${basename}.${ext_lower}",
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
             echo -e "${GREEN}  ✅ Скопирован в POILogos${NC}"
        fi
    fi
done

echo ""
echo -e "${GREEN}🎉 Все иконки успешно обработаны!${NC}"
echo "Не забудь пересобрать проект в Xcode (Cmd + B)."
