import json
import urllib.parse
import re
import urllib.request
import urllib.error

urls = [
    "https://www.google.com/maps/place/South+Beach/@12.1960305,109.2124025,15z/data=!3m1!4b1!4m6!3m5!1s0x3170616a762391a9:0xe272ece530ab2a7f!8m2!3d12.1960308!4d109.2124025!16s%2Fg%2F11gwl7pwxg",
    "https://www.google.com/maps/place/B%C3%A3i+bi%E1%BB%83n+Nha+Trang/@12.2377338,109.2015135,14z/data=!3m1!4b1!4m6!3m5!1s0x31706770f4958433:0xf09b18bfbf27bde7!8m2!3d12.2363391!4d109.1978532!16s%2Fg%2F1tpg_6nr",
    "https://www.google.com/maps/place/Yes+Beach+Nha+Trang/@12.2280513,109.1986981,17.27z/data=!4m6!3m5!1s0x317067b17c8ae795:0x6e4bc055ca687170!8m2!3d12.2282572!4d109.2005359!16s%2Fg%2F11ygz7zk09",
    "https://www.google.com/maps/place/Pizza+4P's+Sheraton+Nha+Trang/@12.2377768,109.1837073,15.02z/data=!4m6!3m5!1s0x3170671ee8e8e5e5:0xf482903fd33692ad!8m2!3d12.2462509!4d109.1961947!16s%2Fg%2F11h5n8z2fn",
    "https://www.google.com/maps/place/%D0%92%D0%BE%D1%80%D0%BE%D1%82%D0%B0/@12.249829,109.0904524,14.28z/data=!4m6!3m5!1s0x31705b7fbb972e2d:0xe6ea5c719fd58d45!8m2!3d12.2555679!4d109.0909266!16s%2Fg%2F124sq39df",
    "https://www.google.com/maps/place/C%E1%BB%ADa+Ti%E1%BB%81n+-+Th%C3%A0nh+Di%C3%AAn+Kh%C3%A1nh/@12.249829,109.0904524,14.28z/data=!4m6!3m5!1s0x31705c7ffa47dfe5:0xb9f6b528d90be134!8m2!3d12.2530423!4d109.0933468!16s%2Fg%2F11gh0lydy0",
    "https://www.google.com/maps/place/%D0%91%D0%90%D0%9D%D0%AF+%2F+DACHA/@12.2578025,109.1283541,16.81z/data=!4m6!3m5!1s0x31705db27db9144d:0x795d2e967c68c240!8m2!3d12.2581992!4d109.1321181!16s%2Fg%2F11vt80ywkf",
    "https://www.google.com/maps/place/%D0%9C%D0%B5%D0%B3%D0%B0+%D0%9C%D0%B0%D1%80%D0%BA%D0%B5%D1%82/@12.2578025,109.130968,16.81z/data=!4m6!3m5!1s0x31705d039ec7b91d:0xd5100d161d17ffbe!8m2!3d12.2574658!4d109.1346809!16s%2Fg%2F1tdkjq44",
    "https://www.google.com/maps/place/Si%C3%AAu+th%E1%BB%8B+Co.opmart+Nha+Trang/@12.2458618,109.1797402,15.95z/data=!4m6!3m5!1s0x31705d5440d0021d:0xdf15c9f3343a3847!8m2!3d12.2427916!4d109.1821128!16s%2Fg%2F12llfp460",
    "https://www.google.com/maps/place/McDonald's+Ga+Nha+Trang/@12.2487236,109.1830651,17.41z/data=!4m6!3m5!1s0x31705d003d481dc3:0x7064adb2f0c77fb1!8m2!3d12.2482632!4d109.1853605!16s%2Fg%2F11v_9w7rhc"
]

def get_desc(point_id, name):
    point_id_lower = point_id.lower()
    
    if "beach" in point_id_lower or "bãi biển" in point_id_lower:
        return {
            "ru": f"Прекрасный пляж {name} с мягким песком и чистой водой. Отличное место для отдыха, солнечных ванн и купания. Обязательно к посещению для любителей моря.",
            "en": f"Beautiful {name} with soft sand and clear water. A great place to relax, sunbathe, and swim. A must-visit for sea lovers.",
            "vi": f"{name} tuyệt đẹp với bãi cát mềm và làn nước trong xanh. Một nơi tuyệt vời để thư giãn, tắm nắng và bơi lội. Không thể bỏ qua đối với những người yêu biển.",
            "ko": f"부드러운 모래와 맑은 물이 있는 아름다운 {name}. 휴식, 일광욕 및 수영을 위한 좋은 장소. 바다 애호가라면 꼭 방문해야 할 곳입니다.",
            "es": f"Hermosa {name} con arena suave y aguas cristalinas. Un gran lugar para relajarse, tomar el sol y nadar. Una visita obligada para los amantes del mar.",
            "zh": f"美丽的 {name}，拥有柔软的沙滩和清澈的海水。放松、享受日光浴和游泳的好地方。海洋爱好者的必游之地。",
            "fr": f"Magnifique {name} avec du sable doux et une eau claire. Un endroit idéal pour se détendre, bronzer et nager. Une visite incontournable pour les amoureux de la mer."
        }
    elif "pizza" in point_id_lower or "4p" in point_id_lower:
        return {
            "ru": f"Популярная пиццерия {name}. Известна своей потрясающей неаполитанской пиццей, сырами собственного производства (особенно бурратой) и первоклассным сервисом.",
            "en": f"Popular pizzeria {name}. Famous for its stunning Neapolitan pizza, house-made cheeses (especially burrata), and top-notch service.",
            "vi": f"Tiệm bánh pizza nổi tiếng {name}. Nổi tiếng với bánh pizza Neapolitan tuyệt đẹp, các loại pho mát tự làm (đặc biệt là burrata) và dịch vụ hạng nhất.",
            "ko": f"인기있는 피자 전문점 {name}. 멋진 나폴리 피자, 직접 만든 치즈(특히 부라타), 최고의 서비스로 유명합니다.",
            "es": f"Pizzería popular {name}. Famosa por su impresionante pizza napolitana, quesos caseros (especialmente burrata) y servicio de primera categoría.",
            "zh": f"受欢迎的比萨店 {name}。以其令人惊叹的那不勒斯比萨饼、自制奶酪（尤其是布拉塔奶酪）和一流的服务而闻名。",
            "fr": f"Pizzeria populaire {name}. Célèbre pour sa superbe pizza napolitaine, ses fromages faits maison (en particulier la burrata) et son service de premier ordre."
        }
    elif "ворота" in point_id_lower or "cửa tiền" in point_id_lower or "thành diên khánh" in point_id_lower:
        return {
            "ru": f"Историческая достопримечательность {name}. Древние архитектурные сооружения и ворота, сохранившие дух прошлого. Идеально для любителей истории и красивых фотографий.",
            "en": f"Historical landmark {name}. Ancient architectural structures and gates that preserve the spirit of the past. Perfect for history buffs and beautiful photos.",
            "vi": f"Di tích lịch sử {name}. Những công trình kiến trúc cổ kính và những cánh cổng lưu giữ hồn của quá khứ. Hoàn hảo cho những người yêu thích lịch sử và những bức ảnh đẹp.",
            "ko": f"역사적인 랜드마크 {name}. 과거의 정기를 간직한 고대 건축물과 성문. 역사 애호가와 아름다운 사진을 찍기에 완벽합니다.",
            "es": f"Monumento histórico {name}. Antiguas estructuras arquitectónicas y puertas que conservan el espíritu del pasado. Perfecto para amantes de la historia y hermosas fotos.",
            "zh": f"历史地标 {name}。保留着过去精神的古建筑和城门。历史爱好者和拍摄精美照片的理想去处。",
            "fr": f"Monument historique {name}. Anciennes structures architecturales et portes qui préservent l'esprit du passé. Parfait pour les passionnés d'histoire et de belles photos."
        }
    elif "баня" in point_id_lower or "dacha" in point_id_lower:
        return {
            "ru": f"Настоящая русская {name}! Отличное место для перезагрузки: горячий пар, веники и душевный отдых. Замечательная возможность расслабиться душой и телом.",
            "en": f"Authentic Russian {name}! A great place to reboot: hot steam, birch brooms, and soulful relaxation. A wonderful opportunity to relax body and soul.",
            "vi": f"Nga đích thực {name}! Một nơi tuyệt vời để khởi động lại: hơi nước nóng, chổi bạch dương và thư giãn tâm hồn. Một cơ hội tuyệt vời để thư giãn cơ thể và tâm hồn.",
            "ko": f"정통 러시아어 {name}! 재부팅하기 좋은 곳: 뜨거운 증기, 자작나무 빗자루, 영혼의 휴식. 몸과 마음의 긴장을 풀 수 있는 멋진 기회입니다.",
            "es": f"¡Auténtico {name} ruso! Un gran lugar para reiniciar: vapor caliente, escobas de abedul y relajación del alma. Una maravillosa oportunidad para relajar cuerpo y alma.",
            "zh": f"正宗的俄语 {name}！重新启动的好地方：热蒸汽、白桦扫帚和深情的放松。放松身心的绝佳机会。",
            "fr": f"Authentique {name} russe ! Un endroit idéal pour redémarrer : vapeur chaude, balais de bouleau et détente émouvante. Une merveilleuse occasion de se détendre le corps et l'âme."
        }
    elif "маркет" in point_id_lower or "co.opmart" in point_id_lower:
        return {
            "ru": f"Крупный супермаркет {name}. Здесь можно найти абсолютно всё: от свежих продуктов питания до бытовой химии, сувениров и одежды. Цены фиксированные и очень приятные.",
            "en": f"Large supermarket {name}. Here you can find absolutely everything: from fresh food to household chemicals, souvenirs, and clothing. Fixed and very reasonable prices.",
            "vi": f"Siêu thị lớn {name}. Tại đây bạn có thể tìm thấy mọi thứ: từ thực phẩm tươi sống đến hóa chất gia dụng, đồ lưu niệm và quần áo. Giá cả cố định và rất hợp lý.",
            "ko": f"대형 슈퍼마켓 {name}. 신선한 식품부터 가정용 화학 제품, 기념품, 의류에 이르기까지 모든 것을 찾을 수 있습니다. 고정되어 있고 매우 합리적인 가격.",
            "es": f"Gran supermercado {name}. Aquí puedes encontrar absolutamente de todo: desde alimentos frescos hasta productos químicos para el hogar, recuerdos y ropa. Precios fijos y muy razonables.",
            "zh": f"大型超市 {name}。在这里您可以找到绝对的一切：从新鲜食品到家用化学品、纪念品和服装。固定且非常合理的价格。",
            "fr": f"Grand supermarché {name}. Ici, vous pouvez trouver absolument tout : des aliments frais aux produits chimiques ménagers, en passant par les souvenirs et les vêtements. Prix fixes et très raisonnables."
        }
    elif "mcdonald" in point_id_lower:
         return {
            "ru": f"Популярный ресторан быстрого питания {name}. Идеальное место для быстрого перекуса, хрустящей курочки и бургеров. Всегда стабильное качество и кондиционер внутри.",
            "en": f"Popular fast-food restaurant {name}. Perfect spot for a quick bite, crispy chicken, and burgers. Consistent quality and air conditioning inside.",
            "vi": f"Nhà hàng thức ăn nhanh nổi tiếng {name}. Nơi hoàn hảo cho bữa ăn nhẹ, gà giòn và hamburger. Chất lượng ổn định và có máy lạnh bên trong.",
            "ko": f"인기있는 패스트푸드 레스토랑 {name}. 빠른 식사, 바삭한 치킨, 햄버거를 즐기기에 완벽한 장소입니다. 일관된 품질과 내부 에어컨이 있습니다.",
            "es": f"Restaurante de comida rápida popular {name}. El lugar perfecto para un bocado rápido, pollo crujiente y hamburguesas. Calidad constante y aire acondicionado.",
            "zh": f"受欢迎的快餐厅 {name}。适合快餐、脆皮炸鸡和汉堡的理想场所。质量稳定，内有空调。",
            "fr": f"Restaurant de restauration rapide populaire {name}. L'endroit idéal pour une bouchée rapide, du poulet frit et des hamburgers. Qualité constante et climatisation."
        }
    else:
        return {
            "ru": f"Отличное место {name}. Интересная локация, которую стоит добавить в свой маршрут.",
            "en": f"Great place {name}. An interesting location worth adding to your itinerary.",
            "vi": f"Nơi tuyệt vời {name}. Một địa điểm thú vị đáng để thêm vào hành trình của bạn.",
            "ko": f"멋진 장소 {name}. 여정에 추가할 가치가 있는 흥미로운 장소입니다.",
            "es": f"Gran lugar {name}. Un lugar interesante que vale la pena agregar a su itinerario.",
            "zh": f"好地方 {name}。值得添加到您的行程中的有趣地点。",
            "fr": f"Super endroit {name}. Un endroit intéressant qui vaut la peine d'être ajouté à votre itinéraire."
        }

poi_objects = []

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
        cat = "sight"
        if "beach" in point_id or "bãi biển" in point_id:
            cat = "beach"
        elif "pizza" in point_id or "mcdonald" in point_id:
            cat = "restaurant"
        elif "ворота" in point_id or "cửa tiền" in point_id or "thành diên khánh" in point_id:
            cat = "sight"
        elif "баня" in point_id or "dacha" in point_id:
            cat = "service"
        elif "маркет" in point_id or "co.opmart" in point_id:
            cat = "shopping"
            
        tags = "wifi; ac; card"
        if cat == "beach": tags = "nature; sunbed; sea"
        if cat == "shopping": tags = "card; local; groceries"
        if "pizza" in point_id: tags = "wifi; ac; pizza; wine; premium"
        if "dacha" in point_id: tags = "sauna; relax; parking"
            
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

print(f"Generated {len(poi_objects)} new POIs.")

# Now POST them immediately to the backend
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

print(f"Upload complete! Successfully added {success_count} POIs to Google Sheets.")
