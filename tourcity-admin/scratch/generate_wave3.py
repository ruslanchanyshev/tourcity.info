import json
import urllib.parse
import re
import urllib.request
import urllib.error

urls = [
    "https://www.google.com/maps/place/Mcdonald%E2%80%99s/@12.2413168,109.1949362,18.74z/data=!4m6!3m5!1s0x317067e9f9f7caf9:0xc339bd3f0c795a44!8m2!3d12.2408287!4d109.1961566!16s%2Fg%2F11pdm8ynps",
    "https://www.google.com/maps/place/Starbucks+Nha+Trang+Center/@12.2477711,109.1959678,21z/data=!4m6!3m5!1s0x317067556d725daf:0x26c4f1d22fe2b490!8m2!3d12.2476886!4d109.1960844!16s%2Fg%2F11n3891d8x",
    "https://www.google.com/maps/place/Domino's+Pizza+Nha+Trang+Center/@12.2477465,109.1952731,21z/data=!4m6!3m5!1s0x3170676f350187b5:0xeb78a9a3c4510a79!8m2!3d12.2476691!4d109.1955355!16s%2Fg%2F11vywtys62",
    "https://www.google.com/maps/place/Starbucks+Coffee+Beachfront/@12.2334237,109.1971492,21z/data=!4m6!3m5!1s0x31706754836cecd5:0x48c2805ea3b14613!8m2!3d12.2333266!4d109.1973666!16s%2Fg%2F11r6xlmbqb"
]

def get_desc(point_id, name):
    point_id_lower = point_id.lower()
    
    if "starbucks" in point_id_lower:
        return {
            "ru": f"Популярная кофейня {name}. Отличное место для любителей качественного кофе и фирменных напитков. Уютная атмосфера, кондиционер и быстрый Wi-Fi. Идеально для работы и встреч.",
            "en": f"Popular coffee shop {name}. A great place for lovers of quality coffee and signature drinks. Cozy atmosphere, air conditioning, and fast Wi-Fi. Perfect for work and meetings.",
            "vi": f"Quán cà phê nổi tiếng {name}. Địa điểm tuyệt vời cho những người yêu thích cà phê chất lượng và đồ uống đặc trưng. Bầu không khí ấm cúng, máy lạnh và Wi-Fi nhanh. Rất thích hợp để làm việc.",
            "ko": f"인기있는 커피숍 {name}. 고품질의 커피와 시그니처 음료를 사랑하는 사람들에게 좋은 장소입니다. 아늑한 분위기, 에어컨, 빠른 Wi-Fi. 작업 및 회의에 완벽합니다.",
            "es": f"Cafetería popular {name}. Un gran lugar para los amantes del café de calidad y bebidas exclusivas. Ambiente acogedor, aire acondicionado y Wi-Fi rápido. Perfecto para trabajar.",
            "zh": f"受欢迎的咖啡店 {name}。适合优质咖啡和招牌饮品爱好者的好去处。舒适的氛围、空调和快速的 Wi-Fi。非常适合工作和会议。",
            "fr": f"Café populaire {name}. Un endroit idéal pour les amateurs de café de qualité et de boissons signatures. Ambiance chaleureuse, climatisation et Wi-Fi rapide. Parfait pour le travail."
        }
    elif "domino" in point_id_lower:
        return {
            "ru": f"Всемирно известная пиццерия {name}. Большой выбор пиццы с быстрой подачей и отличным вкусом. Отличный вариант для быстрого и сытного перекуса с друзьями.",
            "en": f"World-famous pizzeria {name}. A large selection of pizza with fast service and great taste. A great option for a quick and satisfying bite with friends.",
            "vi": f"Tiệm bánh pizza nổi tiếng thế giới {name}. Rất nhiều loại bánh pizza phục vụ nhanh chóng và hương vị tuyệt vời. Lựa chọn tuyệt vời cho một bữa ăn nhanh chóng và ngon miệng.",
            "ko": f"세계적으로 유명한 피자 전문점 {name}. 빠른 서비스와 훌륭한 맛을 자랑하는 다양한 피자. 친구들과 함께 빠르고 만족스러운 식사를 하기에 좋은 선택입니다.",
            "es": f"Pizzería de fama mundial {name}. Gran selección de pizzas con servicio rápido y excelente sabor. Una gran opción para un bocado rápido y satisfactorio con amigos.",
            "zh": f"世界著名的比萨店 {name}。种类繁多的比萨饼，服务快捷，味道极佳。与朋友共进快速美味的一餐的绝佳选择。",
            "fr": f"Pizzeria de renommée mondiale {name}. Un grand choix de pizzas avec un service rapide et un goût excellent. Une excellente option pour une bouchée rapide et satisfaisante avec des amis."
        }
    else:
        return {
            "ru": f"Популярный ресторан быстрого питания {name}. Идеальное место для быстрого перекуса, хрустящей курочки и бургеров. Всегда стабильное качество и кондиционер внутри.",
            "en": f"Popular fast-food restaurant {name}. Perfect spot for a quick bite, crispy chicken, and burgers. Consistent quality and air conditioning inside.",
            "vi": f"Nhà hàng thức ăn nhanh nổi tiếng {name}. Nơi hoàn hảo cho bữa ăn nhẹ, gà giòn và hamburger. Chất lượng ổn định và có máy lạnh bên trong.",
            "ko": f"인기있는 패스트푸드 레스토랑 {name}. 빠른 식사, 바삭한 치킨, 햄버거를 즐기기에 완벽한 장소입니다. 일관된 품질과 내부 에어컨이 있습니다.",
            "es": f"Restaurante de comida rápida popular {name}. El lugar perfecto para un bocado rápido, pollo crujiente y hamburguesas. Calidad constante y aire acondicionado.",
            "zh": f"受欢迎的快餐厅 {name}。适合快餐、脆皮炸鸡和汉堡的理想场所。质量稳定，内有空调。",
            "fr": f"Restaurant de restauration rapide populaire {name}. L'endroit idéal pour une bouchée rapide, du poulet frit et des hamburgers. Qualité constante et climatisation."
        }

poi_objects = []
import uuid

for url in urls:
    match_latlon = re.search(r'@([0-9\.\-]+),([0-9\.\-]+)', url)
    match_name = re.search(r'/place/([^/]+)/', url)
    
    if match_latlon and match_name:
        lat = match_latlon.group(1)
        lon = match_latlon.group(2)
        raw_name = urllib.parse.unquote(match_name.group(1)).replace('+', ' ').strip()
        
        # Clean up names
        clean_name = raw_name
        if '|' in clean_name:
            clean_name = clean_name.split('|')[0].strip()
            
        # Generating a unique ID to avoid overwriting if name is identical
        unique_suffix = str(uuid.uuid4())[:4]
        point_id = clean_name.lower().replace(' ', '_').replace('&', 'and').replace(',', '').replace("'", "").replace("’", "") + "_" + unique_suffix
        
        # Determine category & tags
        cat = "restaurant"
        tags = "wifi; ac"
        
        if "starbucks" in point_id:
            cat = "cafe"
            tags = "wifi; ac; coffee; premium"
        elif "domino" in point_id:
            cat = "restaurant"
            tags = "wifi; ac; pizza; fast_food"
        elif "mcdonald" in point_id:
            cat = "restaurant"
            tags = "wifi; ac; fast_food"
            
        desc = get_desc(point_id, clean_name)
        
        poi = {
            "id": point_id[:30].strip('_'),
            "category": cat,
            "name_ru": clean_name,
            "name_en": clean_name,
            "name_vi": clean_name,
            "name_ko": clean_name,
            "name_es": clean_name,
            "name_zh": clean_name,
            "name_fr": clean_name,
            "desc_ru": desc["ru"],
            "desc_en": desc["en"],
            "desc_vi": desc["vi"],
            "desc_ko": desc["ko"],
            "desc_es": desc["es"],
            "desc_zh": desc["zh"],
            "desc_fr": desc["fr"],
            "all_tags": tags,
            "lat": lat,
            "lon": lon,
            "address": "",
            "phone": "",
            "website": "",
            "hours": "10:00 - 22:00",
            "price": "mid",
            "rating": "4.5",
            "images": "",
            "featured": "0",
            "ext_1": url,
            "ext_2": "",
            "ext_3": "",
            "ext_4": "",
            "ext_5": tags,
            "ext_6": "", "ext_7": "", "ext_8": "", "ext_9": "", "ext_10": "",
            "ext_11": "", "ext_12": "", "ext_13": "", "ext_14": "", "ext_15": "",
            "ext_16": "", "ext_17": "", "ext_18": "", "ext_19": "", "ext_20": ""
        }
        poi_objects.append(poi)

success_count = 0
for poi in poi_objects:
    try:
        req = urllib.request.Request(
            'http://localhost:3001/api/pois',
            data=json.dumps(poi).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        response = urllib.request.urlopen(req)
        print(f"[SUCCESS] Added: {poi['name_ru']}")
        success_count += 1
    except urllib.error.URLError as e:
        print(f"[ERROR] Failed to add {poi['name_ru']}: {e.reason}")

print(f"Upload complete! Added {success_count} POIs.")
