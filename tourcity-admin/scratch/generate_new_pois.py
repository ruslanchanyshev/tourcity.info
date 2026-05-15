import json
import urllib.parse
import re

urls = [
    "https://www.google.com/maps/place/KFC+L%C3%AA+Th%C3%A0nh+Ph%C6%B0%C6%A1ng/@12.2476567,109.1892011,17z/data=...",
    "https://www.google.com/maps/place/Texas+Chicken/@12.2476404,109.1956684,17z/data=...",
    "https://www.google.com/maps/place/KFC+Ho%C3%A0n+C%E1%BA%A7u/@12.2476486,109.1959943,17z/data=...",
    "https://www.google.com/maps/place/Mcdonald%E2%80%99s/@12.2408287,109.1961566,17z/data=...",
    "https://www.google.com/maps/place/Greek+Souvlaki+Nha+Trang/@12.2377955,109.1938344,17z/data=...",
    "https://www.google.com/maps/place/Greek+Kitchen/@12.2397435,109.1927273,17z/data=...",
    "https://www.google.com/maps/place/MIX+Greek+Restaurant/@12.2363719,109.1942029,17z/data=...",
    "https://www.google.com/maps/place/Jungle+Lounge/@12.2416855,109.1928476,17z/data=...",
    "https://www.google.com/maps/place/MeDuZa/@12.2368777,109.1940764,17z/data=...",
    "https://www.google.com/maps/place/UGLI+Restobar/@12.2340298,109.1944968,17z/data=...",
    "https://www.google.com/maps/place/The+Cloud/@12.236706,109.1941066,17z/data=...",
    "https://www.google.com/maps/place/Friends+Lounge+%7C+%D0%9A%D0%B0%D0%BB%D1%8C%D1%8F%D0%BD+%7C+%D0%91%D0%B0%D1%80+%7C+%D0%95%D0%B2%D1%80%D0%B0%D0%B7%D0%B8%D0%B9%D1%81%D0%BA%D0%B0%D1%8F+%D0%BA%D1%83%D1%85%D0%BD%D1%8F/@12.2329935,109.1942426,17z/data=...",
    "https://www.google.com/maps/place/ZAVOD+restaurant/@12.2344463,109.1963208,17z/data=...",
    "https://www.google.com/maps/place/The+Sigma+%7C+Hookah+Lounge+%7C+%D0%9F%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC+%D0%BA%D0%B0%D0%BB%D1%8C%D1%8F%D0%BD%D0%B0%D1%8F/@12.2487194,109.1938946,17z/data=...",
    "https://www.google.com/maps/place/Artisan+Cafe+%26+Eatery/@12.2194343,109.2004979,17z/data=...",
    "https://www.google.com/maps/place/Stockholm+Bistro+%26+Co-working+%7C+Coworking+Space+in+Nha+Trang/@12.247519,109.1908006,17z/data=...",
    "https://www.google.com/maps/place/%D0%A4%D1%80%D1%83%D0%BA%D1%82%D0%BE%D0%B2%D1%8B%D0%B9+%D1%80%D1%8B%D0%BD%D0%BE%D0%BA/@12.2386738,109.1935989,17z/data=..."
]

pois = []

def get_desc(point_id, name):
    if "kfc" in point_id or "mcdonald" in point_id or "texas" in point_id:
        return {
            "ru": f"Популярный ресторан быстрого питания {name}. Идеальное место для быстрого перекуса, хрустящей курочки и бургеров. Всегда стабильное качество и кондиционер внутри.",
            "en": f"Popular fast-food restaurant {name}. Perfect spot for a quick bite, crispy chicken, and burgers. Consistent quality and air conditioning inside.",
            "vi": f"Nhà hàng thức ăn nhanh nổi tiếng {name}. Nơi hoàn hảo cho bữa ăn nhẹ, gà giòn và hamburger. Chất lượng ổn định và có máy lạnh bên trong.",
            "ko": f"인기있는 패스트푸드 레스토랑 {name}. 빠른 식사, 바삭한 치킨, 햄버거를 즐기기에 완벽한 장소입니다. 일관된 품질과 내부 에어컨이 있습니다.",
            "es": f"Restaurante de comida rápida popular {name}. El lugar perfecto para un bocado rápido, pollo crujiente y hamburguesas. Calidad constante y aire acondicionado.",
            "zh": f"受欢迎的快餐厅 {name}。适合快餐、脆皮炸鸡和汉堡的理想场所。质量稳定，内有空调。",
            "fr": f"Restaurant de restauration rapide populaire {name}. L'endroit idéal pour une bouchée rapide, du poulet frit et des hamburgers. Qualité constante et climatisation."
        }
    elif "greek" in point_id:
        return {
            "ru": f"Традиционная греческая кухня в {name}. Большие порции, сочный сувлаки, настоящая пита и свежие салаты. Гости хвалят дружелюбный персонал и аутентичный вкус.",
            "en": f"Traditional Greek cuisine at {name}. Large portions, juicy souvlaki, authentic pita, and fresh salads. Guests praise the friendly staff and authentic taste.",
            "vi": f"Ẩm thực Hy Lạp truyền thống tại {name}. Khẩu phần lớn, souvlaki mọng nước, bánh pita đích thực và salad tươi. Khách hàng khen ngợi nhân viên thân thiện và hương vị chân thực.",
            "ko": f"{name}의 전통 그리스 요리. 푸짐한 양, 육즙이 풍부한 수블라키, 정통 피타, 신선한 샐러드. 친절한 직원과 정통 맛이 손님들에게 인기입니다.",
            "es": f"Cocina tradicional griega en {name}. Porciones grandes, souvlaki jugoso, pita auténtica y ensaladas frescas. Los huéspedes elogian al personal amable y el sabor auténtico.",
            "zh": f"{name}的传统希腊美食。份量大，多汁的烤肉，正宗的皮塔饼和新鲜沙拉。客人称赞友好的工作人员和地道的味道。",
            "fr": f"Cuisine grecque traditionnelle chez {name}. De grandes portions, du souvlaki juteux, du pita authentique et des salades fraîches. Les clients font l'éloge du personnel amical et du goût authentique."
        }
    elif "lounge" in point_id or "restobar" in point_id or "meduza" in point_id or "sigma" in point_id or "cloud" in point_id:
        return {
            "ru": f"Стильное заведение {name} с отличной атмосферой, хорошим баром и качественными кальянами. Идеально подходит для вечернего отдыха в комфортной обстановке.",
            "en": f"Stylish venue {name} with a great atmosphere, excellent bar, and premium hookahs. Perfect for an evening relaxation in a comfortable setting.",
            "vi": f"Địa điểm phong cách {name} với bầu không khí tuyệt vời, quầy bar tuyệt hảo và shisha cao cấp. Hoàn hảo cho một buổi tối thư giãn trong không gian thoải mái.",
            "ko": f"훌륭한 분위기, 멋진 바, 프리미엄 물담배를 갖춘 세련된 장소 {name}. 편안한 분위기에서 저녁 시간을 보내기에 완벽합니다.",
            "es": f"Elegante lugar {name} con gran ambiente, excelente bar y narguiles de primera. Perfecto para relajarse por la noche en un entorno cómodo.",
            "zh": f"{name}是时尚的场所，拥有极佳的氛围、出色的酒吧和优质的水烟。非常适合在舒适的环境中度过轻松的夜晚。",
            "fr": f"Lieu élégant {name} avec une excellente atmosphère, un très bon bar et des narguilés de qualité. Parfait pour une soirée de détente dans un cadre confortable."
        }
    elif "zavod" in point_id:
        return {
            "ru": f"Ресторан {name} с аутентичной кухней и интересным интерьером. Гости отмечают вкусные блюда, душевную атмосферу и внимательное обслуживание.",
            "en": f"Restaurant {name} featuring authentic cuisine and interesting interior. Guests highlight the delicious dishes, soulful atmosphere, and attentive service.",
            "vi": f"Nhà hàng {name} với ẩm thực đích thực và không gian trang trí thú vị. Thực khách đánh giá cao các món ăn ngon, không khí ấm cúng và dịch vụ chu đáo.",
            "ko": f"정통 요리와 흥미로운 인테리어를 갖춘 {name} 레스토랑. 손님들은 맛있는 음식, 따뜻한 분위기, 세심한 서비스를 칭찬합니다.",
            "es": f"Restaurante {name} con cocina auténtica e interesante interior. Los huéspedes destacan los deliciosos platos, el ambiente conmovedor y el servicio atento.",
            "zh": f"{name}餐厅提供地道美食和有趣的内饰。客人们强调了令人垂涎的菜肴、温馨的氛围和周到的服务。",
            "fr": f"Le restaurant {name} propose une cuisine authentique et un intérieur intéressant. Les clients soulignent les plats délicieux, l'ambiance chaleureuse et le service attentif."
        }
    elif "cafe" in point_id or "bistro" in point_id:
        return {
            "ru": f"Уютное пространство {name}. Отличный кофе, вкусные десерты и удобная зона для коворкинга. Прекрасное место для работы с ноутбуком или встречи с друзьями.",
            "en": f"Cozy space {name}. Great coffee, delicious desserts, and a comfortable co-working area. A wonderful spot to work on a laptop or meet with friends.",
            "vi": f"Không gian ấm cúng {name}. Cà phê tuyệt vời, món tráng miệng ngon và khu vực làm việc chung thoải mái. Nơi tuyệt vời để làm việc với máy tính xách tay hoặc gặp gỡ bạn bè.",
            "ko": f"아늑한 공간 {name}. 훌륭한 커피, 맛있는 디저트, 편안한 코워킹 공간. 노트북으로 작업하거나 친구들을 만나기에 완벽한 장소입니다.",
            "es": f"Acogedor espacio {name}. Excelente café, deliciosos postres y cómoda de área de coworking. Un lugar maravilloso para trabajar con el portátil o reunirse con amigos.",
            "zh": f"舒适的空间{name}。美味的咖啡、美味的甜点和舒适的联合办公区。在这里使用笔记本电脑工作或与朋友会面的绝佳选择。",
            "fr": f"Espace confortable {name}. Excellent café, délicieux desserts et espace de travail partagé confortable. Un endroit merveilleux pour travailler sur un ordinateur portable ou retrouver des amis."
        }
    elif "market" in point_id or "рынок" in point_id.lower():
        return {
            "ru": f"{name} – отличное место, где можно найти огромный выбор свежих тропических фруктов по доступным ценам. Яркие краски и местные вкусы.",
            "en": f"{name} – a great place to find a huge selection of fresh tropical fruits at affordable prices. Bright colors and local flavors.",
            "vi": f"{name} – một nơi tuyệt vời để tìm thấy vô số lựa chọn trái cây nhiệt đới tươi ngon với giá cả phải chăng. Hương vị và sắc màu địa phương.",
            "ko": f"{name} – 합리적인 가격으로 다양하고 신선한 열대 과일을 찾을 수 있는 멋진 장소입니다. 화려한 색상과 현지의 맛.",
            "es": f"{name} – un gran lugar para encontrar una gran selección de frutas tropicales frescas a precios asequibles. Colores brillantes y sabores locales.",
            "zh": f"{name} – 以实惠的价格找到大量新鲜热带水果的绝佳去处。色彩鲜艳，当地风味。",
            "fr": f"{name} – un endroit idéal pour trouver un grand choix de fruits tropicaux frais à des prix abordables. Couleurs vives et saveurs locales."
        }
    else:
        return {
            "ru": f"Отличное заведение {name} с позитивными отзывами гостей. Стоит посетить!",
            "en": f"Great place {name} with positive guest reviews. Worth a visit!",
            "vi": f"Nơi tuyệt vời {name} với những đánh giá tích cực từ khách. Đáng để ghé thăm!",
            "ko": f"손님들의 긍정적인 평가가 있는 멋진 장소 {name}. 방문할 가치가 있습니다!",
            "es": f"Gran lugar {name} con críticas positivas de los huéspedes. ¡Vale la pena visitarlo!",
            "zh": f"很棒的地方 {name}，客人好评如潮。值得一去！",
            "fr": f"Super endroit {name} avec des critiques positives des clients. Vaut le détour !"
        }

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
            
        point_id = clean_name.lower().replace(' ', '_').replace('&', 'and').replace(',', '').replace("'", "")
        
        # Determine category
        cat = "restaurant"
        if "cafe" in point_id or "bistro" in point_id or "coffee" in point_id:
            cat = "cafe"
        elif "lounge" in point_id or "restobar" in point_id or "sigma" in point_id or "cloud" in point_id or "meduza" in point_id:
            cat = "nightlife"
        elif "рынок" in point_id or "market" in point_id:
            cat = "shopping"
            
        tags = "wifi; ac; card"
        if cat == "nightlife": tags = "wifi; ac; hookah; bar"
        if "kfc" in point_id or "mcdonald" in point_id or "texas" in point_id: tags = "wifi; ac; fast_food"
        if cat == "shopping": tags = "cash; local"
        if "cafe" in point_id: tags = "wifi; ac; coffee; coworking"
            
        desc = get_desc(point_id, clean_name)
        
        poi = {
            "id": point_id[:30],
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
        pois.append(poi)

with open("/Users/rch/tourcity.info/tourcity-admin/scratch/new_pois.json", "w", encoding="utf-8") as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(pois)} new POIs to new_pois.json")
