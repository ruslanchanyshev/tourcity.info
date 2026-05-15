import sys
import os

file_path = '/Users/rch/tourcity.info/TourCity/Services/LocalizationManager.swift'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_onboarding = False

# Define the new content for the onboarding section
onboarding_content = """        "onboarding_welcome": [
            .ru: "Добро пожаловать в TourCity",
            .en: "Welcome to TourCity",
            .vi: "Chào mừng đến với TourCity",
            .ko: "TourCity에 오신 것을 환영합니다",
            .es: "Bienvenido a TourCity",
            .zh: "欢迎来到 TourCity",
            .fr: "Bienvenue sur TourCity"
        ],
        "onboarding_subtitle": [
            .ru: "Ваш персональный офлайн-гид по городу.\\nВсе самое интересное — в одном приложении.",
            .en: "Your personal offline city guide.\\nAll the best spots in one app.",
            .vi: "Hướng dẫn viên du lịch ngoại tuyến cá nhân.\\nTất cả các điểm đến tốt nhất trong một ứng dụng.",
            .ko: "당신의 개인 오프라인 도시 가이드.\\n최고의 장소들을 하나의 앱에서 만나보세요.",
            .es: "Tu guía personal de la ciudad sin conexión.\\nLos mejores lugares en una sola aplicación.",
            .zh: "您的个人离线城市指南。\\n所有最好的景点都在一个应用程序中。",
            .fr: "Votre guide personnel de la ville hors ligne.\\nTous les meilleurs endroits dans une seule application."
        ],
        "onboarding_offline_title": [
            .ru: "Оффлайн свобода",
            .en: "Offline Freedom",
            .vi: "Tự do ngoại tuyến",
            .ko: "오프라인 자유",
            .es: "Libertad offline",
            .zh: "离线自由",
            .fr: "Liberté hors ligne"
        ],
        "onboarding_offline_desc": [
            .ru: "Гуляйте по городу легко и без интернета.\\nВаша карта всегда под рукой.",
            .en: "Explore the city with ease and no internet.\\nYour map is always with you.",
            .vi: "Khám phá thành phố dễ dàng mà không cần internet.\\nBản đồ luôn bên bạn.",
            .ko: "인터넷 없이도 도시를 쉽게 탐험하세요.\\n지도는 항상 당신과 함께합니다.",
            .es: "Explora la ciudad con facilidad y sin Internet.\\nTu mapa siempre está contigo.",
            .zh: "无需网络即可轻松探索城市。\\n您的地图始终随身携带。",
            .fr: "Explorez la ville en toute simplicité et sans Internet.\\nVotre карта всегда под рукой."
        ],
        "onboarding_curated_title": [
            .ru: "Только лучшее",
            .en: "Only the Best",
            .vi: "Chỉ những điều tốt nhất",
            .ko: "최고만을 담았습니다",
            .es: "Solo lo mejor",
            .zh: "只有最好的",
            .fr: "Le meilleur seulement"
        ],
        "onboarding_curated_desc": [
            .ru: "Самые популярные и вкусные места.\\nБаза обновляется новыми локациями каждый месяц.",
            .en: "The most popular and delicious spots.\\nDatabase is updated with new locations monthly.",
            .vi: "Những địa điểm nổi tiếng và ngon nhất.\\nDữ liệu được cập nhật vị trí mới hàng tháng.",
            .ko: "가장 인기 있고 맛있는 장소들.\\n데이터베이스는 매달 새로운 장소로 업데이트됩니다.",
            .es: "Los lugares más populares и deliciosos.\\nLa base de datos se actualiza con nuevos места каждый месяц.",
            .zh: "最受欢迎 и美味的景点。\\n数据库每月都会更新新地点。",
            .fr: "Les endroits les plus populaires et les plus délicieux.\\nLa base de données est mise à jour mensuellement."
        ],
        "onboarding_discounts_title": [
            .ru: "Ваша выгода",
            .en: "Your Benefits",
            .vi: "Lợi ích của bạn",
            .ko: "당신을 위한 혜택",
            .es: "Tus beneficios",
            .zh: "您的利益",
            .fr: "Vos avantages"
        ],
        "onboarding_discounts_desc": [
            .ru: "Пользуйтесь эксклюзивными скидками и бонусами.\\nСпециальные предложения в лучших заведениях города.",
            .en: "Enjoy exclusive discounts and special offers.\\nAt the city's top venues.",
            .vi: "Tận hưởng các ưu đãi и giảm giá độc quyền.\\nƯu đãi đặc biệt tại các địa điểm hàng đầu thành phố.",
            .ko: "도시 최고의 명소에서 독점 할인과 특별 혜택을 누리세요.\\nСпециальные предложения специально для вас.",
            .es: "Disfruta de descuentos exclusivos и ofertas especiales.\\nEn los mejores lugares de la ciudad.",
            .zh: "在城市顶级场所享受独家折扣 и 特別优惠。\\n获取为您准备的特别优惠。",
            .fr: "Profitez de réductions exclusives et d'offres spéciales.\\nDans les meilleurs lieux de la ville."
        ],
        "onboarding_guide_title": [
            .ru: "Умный гид",
            .en: "Smart Guide",
            .vi: "Hướng dẫn thông minh",
            .ko: "스마트 가이드",
            .es: "Guía inteligente",
            .zh: "智能指南",
            .fr: "Guide intelligent"
        ],
        "onboarding_guide_desc": [
            .ru: "Читайте подробные описания мест.\\nНаходите всё самое интересное рядом с вами.",
            .en: "Read detailed descriptions of places.\\nFind all the most interesting things right next to you.",
            .vi: "Đọc mô tả chi tiết về các địa điểm.\\nTìm thấy tất cả những điều thú vị nhất gần bạn.",
            .ko: "지세한 설명을 읽고 바로 근처에 있는 흥미로운 장소를 찾아보세요.\\n내 주변의 가장 흥ми로운 것들을 모두 찾아보세요.",
            .es: "Lee descripciones detalladas de los lugares.\\nEncuentra todo lo más interesante cerca de ti.",
            .zh: "阅读地点的详细说明。\\n寻找您附近所有最有趣的事物。",
            .fr: "Lisez des descriptions détaillées des lieux.\\nTrouvez toutes les choses les plus interesantes près de vous."
        ],
        "onboarding_button": [.ru: "Начать", .en: "Get Started", .vi: "Bắt đầu", .ko: "시작하기", .es: "Empezar", .zh: "开始", .fr: "Commencer"],
        "onboarding_next": [.ru: "Далее", .en: "Next", .vi: "Tiếp theo", .ko: "다음", .es: "Siguiente", .zh: "下一步", .fr: "Suivant"],
"""

start_found = False
end_found = False

output_lines = []
skip_mode = False

for line in lines:
    if '"onboarding_welcome": [' in line:
        skip_mode = True
        output_lines.append(onboarding_content)
        continue
    
    if skip_mode:
        if '"onboarding_next":' in line and '],' in line:
            skip_mode = False
        continue
    
    output_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Successfully replaced onboarding section with line breaks.")
