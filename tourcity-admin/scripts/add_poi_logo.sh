#!/bin/bash
# ============================================================
# TourCity — Добавление кастомного логотипа для локации
# ============================================================
# Использование:
#   ./add_poi_logo.sh <имя_лого> <путь_к_файлу.png|.pdf>
#
# Пример:
#   ./add_poi_logo.sh sunset_beach_resort /Desktop/logo.png
#
# После этого в Supabase в поле ext_6 для нужного POI пропиши:
#   sunset_beach_resort
# ============================================================

set -e

LOGO_NAME="$1"
SOURCE_FILE="$2"
ASSETS_DIR="/Users/rch/tourcity.info/TourCity/Resources/Assets.xcassets/POILogos"

# Проверки
if [ -z "$LOGO_NAME" ] || [ -z "$SOURCE_FILE" ]; then
    echo "❌ Использование: ./add_poi_logo.sh <имя_лого> <путь_к_файлу>"
    echo ""
    echo "   Имя лого — латиница, без пробелов (например: grand_hotel или sunset_cafe)"
    echo "   Файл     — PNG (1x/2x/3x) или PDF (векторный, рекомендуется)"
    exit 1
fi

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Файл не найден: $SOURCE_FILE"
    exit 1
fi

# Проверяем имя (только латиница, цифры, подчёркивание)
if [[ ! "$LOGO_NAME" =~ ^[a-z0-9_]+$ ]]; then
    echo "❌ Имя лого должно содержать только строчные буквы, цифры и подчёркивание"
    echo "   Например: grand_hotel, sunset_cafe_2, beach_club"
    exit 1
fi

# Определяем расширение
EXT="${SOURCE_FILE##*.}"
EXT_LOWER="${EXT,,}"

if [[ "$EXT_LOWER" != "png" && "$EXT_LOWER" != "pdf" && "$EXT_LOWER" != "svg" ]]; then
    echo "⚠️  Предпочтительный формат: PDF (векторный) или PNG. Файл: $SOURCE_FILE"
fi

# Создаём imageset
IMAGESET_DIR="$ASSETS_DIR/${LOGO_NAME}.imageset"
mkdir -p "$IMAGESET_DIR"

# Копируем файл
DEST_FILE="$IMAGESET_DIR/${LOGO_NAME}.${EXT_LOWER}"
cp "$SOURCE_FILE" "$DEST_FILE"

# Генерируем Contents.json
if [[ "$EXT_LOWER" == "pdf" ]]; then
    # PDF — один файл, preserves-vector
    cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "${LOGO_NAME}.${EXT_LOWER}",
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
else
    # PNG — обычный растровый ассет
    cat > "$IMAGESET_DIR/Contents.json" << JSONEOF
{
  "images" : [
    {
      "filename" : "${LOGO_NAME}.${EXT_LOWER}",
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
fi

echo ""
echo "✅ Логотип добавлен!"
echo ""
echo "📁 Файл:     $DEST_FILE"
echo "📦 Ассет:    POILogos/${LOGO_NAME}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Следующий шаг — заполни Supabase:"
echo ""
echo "   UPDATE pois SET ext_6 = '${LOGO_NAME}'"
echo "   WHERE id = '<id_локации>';"
echo ""
echo "   Или через Admin Panel → редактирование POI → ext_6"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
