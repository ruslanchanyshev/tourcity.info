import Foundation
import CoreLocation
import UIKit

/// Point of Interest — основная единица контента в гиде
struct POI: Identifiable, Codable, Hashable {
    let id: String
    let category: POICategory
    
    // Мультиязычный контент
    let names: [String: String]        // ["ru": "...", "en": "..."]
    let descriptions: [String: String]
    let localizedTags: [String: [String]] // ["ru": ["тег1", "тег2"], "en": ["tag1", "tag2"]]
    
    // Доп. информация
    let latitude: Double
    let longitude: Double
    let address: String?
    let phone: String?
    let website: String?
    let openingHours: String?
    let priceRange: PriceRange?
    let rating: Double?
    let imageNames: [String]
    let isFeatured: Bool
    
    // Запасные поля на будущее
    let extraMetadata: [String: String] // ["ext_1": "...", "ext_2": "...", "ext_6": "имя_логотипа"]
    
    /// Имя кастомного логотипа для конкретной локации (из поля ext_6).
    /// Файл должен лежать в Assets.xcassets/POILogos/<имя>.imageset
    var customLogoName: String? {
        guard let name = extraMetadata["ext_6"]?.trimmingCharacters(in: .whitespaces),
              !name.isEmpty else { return nil }
        return name
    }
    
    /// Полное имя ассета для кастомного логотипа (с namespace POILogos/)
    var customLogoAssetName: String? {
        guard let name = customLogoName else { return nil }
        return "POILogos/\(name)"
    }
    
    /// Есть ли у локации свой кастомный логотип
    var hasCustomLogo: Bool {
        guard let assetName = customLogoAssetName else { return false }
        return UIImage(named: assetName) != nil
    }
    
    /// Скидка, подтягиваемая из запасного поля ext_2
    var discount: Int? {
        if let ext2 = extraMetadata["ext_2"], let value = Int(ext2.trimmingCharacters(in: .whitespaces)) {
            return value
        }
        return nil
    }
    
    /// Является ли предложение специальным (не в процентах, а подарок/бонус)
    var isSpecialOffer: Bool {
        extraMetadata["ext_2"]?.trimmingCharacters(in: .whitespaces) == "Special"
    }
    
    /// Дополнительная информация по скидке (правила, условия) из поля ext_4.
    /// Поддерживает числовые коды для автоматической локализации.
    var extraDiscountInfo: String? {
        guard let raw = extraMetadata["ext_4"]?.trimmingCharacters(in: .whitespaces), !raw.isEmpty else {
            return nil
        }
        
        // Если это числовой код, пробуем найти перевод
        if CharacterSet.decimalDigits.isSuperset(of: CharacterSet(charactersIn: raw)) {
            let key = "disc_code_\(raw)"
            let localized = LocalizationManager.shared.string(for: key)
            
            // Если перевод нашелся (ключ не вернулся обратно), возвращаем его
            if localized != key {
                return localized
            }
        }
        
        // В противном случае возвращаем как есть (для кастомного текста)
        return raw
    }
    
    /// Дата окончания скидки из поля ext_3 (поддерживает форматы YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY)
    var discountExpiryDate: Date? {
        guard let dateString = extraMetadata["ext_3"]?.trimmingCharacters(in: .whitespaces), !dateString.isEmpty else {
            return nil
        }
        
        let formats = ["yyyy-MM-dd", "dd.MM.yyyy", "dd/MM/yyyy"]
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        
        for format in formats {
            formatter.dateFormat = format
            if let date = formatter.date(from: dateString) {
                return date
            }
        }
        return nil
    }
    
    /// Проверка, актуальна ли скидка на текущий момент
    var isValidDiscount: Bool {
        // 1. Проверяем, что скидка есть (>0%) ИЛИ это специальное предложение
        let hasValue = (discount ?? 0) >= 1 || isSpecialOffer
        guard hasValue else { return false }
        
        // 2. Проверяем наличие даты окончания (по вашей просьбе: если даты нет — не отображаем)
        guard let expiry = discountExpiryDate else { return false }
        
        // 3. Проверяем, не прошла ли дата
        return Calendar.current.startOfDay(for: expiry) >= Calendar.current.startOfDay(for: Date())
    }
    
    /// Публичные теги (Wi-Fi, Кондиционер и т.д.) из запасного поля ext_5.
    /// Теги должны быть разделены точкой с запятой в таблице.
    var publicTags: [String] {
        guard let raw = extraMetadata["ext_5"]?.trimmingCharacters(in: .whitespaces), !raw.isEmpty else {
            return []
        }
        
        let rawTags = raw.components(separatedBy: CharacterSet(charactersIn: ";,"))
            .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
            .filter { !$0.isEmpty }
        
        var uniquePublicTags: [String] = []
        for tag in rawTags {
            let key = "tag_\(tag)"
            let localized = LocalizationManager.shared.string(for: key)
            let finalTag = (localized != key) ? localized : (tag.prefix(1).uppercased() + tag.dropFirst())
            
            if !uniquePublicTags.contains(finalTag) {
                uniquePublicTags.append(finalTag)
            }
        }
        return uniquePublicTags
    }
    
    /// Информация о ближайшем событии (ext_7–ext_11)
    var eventName: String? {
        guard let name = extraMetadata["ext_7"]?.trimmingCharacters(in: .whitespaces), !name.isEmpty else { return nil }
        return name
    }
    
    var eventDate: String? { extraMetadata["ext_8"]?.trimmingCharacters(in: .whitespaces) }
    var eventTime: String? { extraMetadata["ext_9"]?.trimmingCharacters(in: .whitespaces) }
    var eventLocation: String? { extraMetadata["ext_10"]?.trimmingCharacters(in: .whitespaces) }
    var eventConditions: String? { extraMetadata["ext_11"]?.trimmingCharacters(in: .whitespaces) }
    
    /// Дата события в формате Date для сравнения
    var eventDateObj: Date? {
        guard let dateString = eventDate, !dateString.isEmpty else { return nil }
        
        let formats = ["dd.MM.yyyy", "yyyy-MM-dd", "dd/MM/yyyy"]
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        
        for format in formats {
            formatter.dateFormat = format
            if let date = formatter.date(from: dateString) {
                return date
            }
        }
        return nil
    }
    
    var hasEvent: Bool {
        guard eventName != nil else { return false }
        
        // Если дата указана, проверяем, не прошла ли она
        if let eventDate = eventDateObj {
            let today = Calendar.current.startOfDay(for: Date())
            let eventDay = Calendar.current.startOfDay(for: eventDate)
            return eventDay >= today // Событие актуально, если оно сегодня или в будущем
        }
        
        return true // Если дата не указана, считаем событие активным (для обратной совместимости)
    }
    
    // Обратная совместимость для UI (выдает данные на текущем языке)
    var name: String {
        let lang = LocalizationManager.shared.currentLanguage.rawValue
        return names[lang] ?? names["en"] ?? id
    }
    
    var description: String {
        let lang = LocalizationManager.shared.currentLanguage.rawValue
        return descriptions[lang] ?? descriptions["en"] ?? ""
    }
    
    var tags: [String] {
        let lang = LocalizationManager.shared.currentLanguage.rawValue
        // Берем сырые теги из таблицы
        let rawTags = localizedTags[lang] ?? (localizedTags["all"] ?? [])
        
        var uniqueTags: [String] = []
        for tag in rawTags {
            let localized = LocalizationManager.shared.string(for: tag)
            let finalTag = (localized != tag) ? localized : tag
            
            // Если мы уже добавили такой же переведенный тег (например, "Юг"), пропускаем его
            if !uniqueTags.contains(finalTag) {
                uniqueTags.append(finalTag)
            }
        }
        
        return uniqueTags
    }
    
    // Теги для отображения на карточке (скрываем технические поисковые теги)
    var displayTags: [String] {
        let lang = LocalizationManager.shared.currentLanguage.rawValue
        let rawTags = localizedTags[lang] ?? (localizedTags["all"] ?? [])
        
        var uniqueTags: [String] = []
        for tag in rawTags {
            // Пропускаем теги поиска и внутренние теги
            if tag.hasPrefix("tag_search_") || tag.hasPrefix("mall_") || tag == "repeat_visit" {
                continue
            }
            
            let localized = LocalizationManager.shared.string(for: tag)
            let finalTag = (localized != tag) ? localized : tag
            
            if !uniqueTags.contains(finalTag) {
                uniqueTags.append(finalTag)
            }
        }
        
        return uniqueTags
    }
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    /// Рассчитывает расстояние от точки интереса до заданного местоположения
    func distance(from location: CLLocation) -> CLLocationDistance {
        let poiLocation = CLLocation(latitude: latitude, longitude: longitude)
        return poiLocation.distance(from: location)
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: POI, rhs: POI) -> Bool {
        lhs.id == rhs.id
    }
}

/// Категории POI
enum POICategory: String, Codable, CaseIterable, Identifiable {
    case beach = "beach"
    case restaurant = "restaurant"
    case cafe = "cafe"
    case hotel = "hotel"
    case temple = "temple"
    case museum = "museum"
    case shopping = "shopping"
    case nightlife = "nightlife"
    case nature = "nature"
    case entertainment = "entertainment"
    case transport = "transport"
    case medical = "medical"
    case service = "service"
    case sight = "sight"
    case fastfood = "fastfood"
    case spa = "spa"
    
    // Service Categories
    case beauty = "beauty"
    case hair = "hair"
    case health = "health"
    case fitness = "fitness"
    case photo_video = "photo_video"
    case legal_visa = "legal_visa"
    case real_estate = "real_estate"
    case home_services = "home_services"
    case tech_repair = "tech_repair"
    case auto_moto = "auto_moto"
    case kids = "kids"
    case education = "education"
    case events = "events"
    case flowers = "flowers"
    case pets = "pets"
    case delivery = "delivery"
    case tattoo = "tattoo"
    case astrology = "astrology"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .beach: return "cat_beach".localized
        case .restaurant: return "cat_restaurant".localized
        case .cafe: return "cat_cafe".localized
        case .hotel: return "cat_hotel".localized
        case .temple: return "cat_temple".localized
        case .museum: return "cat_museum".localized
        case .shopping: return "cat_shopping".localized
        case .nightlife: return "cat_nightlife".localized
        case .nature: return "cat_nature".localized
        case .entertainment: return "cat_entertainment".localized
        case .transport: return "cat_transport".localized
        case .medical: return "cat_medical".localized
        case .service: return "cat_service".localized
        case .sight: return "cat_sight".localized
        case .fastfood: return "cat_fastfood".localized
        case .spa: return "cat_spa".localized
        
        // Service Categories
        case .beauty: return "cat_beauty".localized
        case .hair: return "cat_hair".localized
        case .health: return "cat_health".localized
        case .fitness: return "cat_fitness".localized
        case .photo_video: return "cat_photo_video".localized
        case .legal_visa: return "cat_legal_visa".localized
        case .real_estate: return "cat_real_estate".localized
        case .home_services: return "cat_home_services".localized
        case .tech_repair: return "cat_tech_repair".localized
        case .auto_moto: return "cat_auto_moto".localized
        case .kids: return "cat_kids".localized
        case .education: return "cat_education".localized
        case .events: return "cat_events".localized
        case .flowers: return "cat_flowers".localized
        case .pets: return "cat_pets".localized
        case .delivery: return "cat_delivery".localized
        case .tattoo: return "cat_tattoo".localized
        case .astrology: return "cat_astrology".localized
        }
    }
    
    var icon: String {
        switch self {
        case .beach: return "sun.max.fill"
        case .restaurant: return "fork.knife"
        case .cafe: return "cup.and.saucer.fill"
        case .hotel: return "bed.double.fill"
        case .temple: return "building.columns.fill"
        case .museum: return "building.fill"
        case .shopping: return "bag.fill"
        case .nightlife: return "moon.stars.fill"
        case .nature: return "leaf.fill"
        case .entertainment: return "star.fill"
        case .transport: return "car.fill"
        case .medical: return "cross.case.fill"
        case .service: return "wrench.and.screwdriver.fill"
        case .sight: return "camera.fill"
        case .fastfood: return "takeoutbag.and.cup.and.straw.fill"
        case .spa: return "leaf.fill"
        
        // Service Categories (Default icons, can be improved later)
        case .beauty: return "sparkles"
        case .hair: return "scissors"
        case .health: return "heart.fill"
        case .fitness: return "figure.run"
        case .photo_video: return "camera.macro"
        case .legal_visa: return "doc.text.fill"
        case .real_estate: return "house.fill"
        case .home_services: return "hammer.fill"
        case .tech_repair: return "desktopcomputer"
        case .auto_moto: return "car.2.fill"
        case .kids: return "stroller.fill"
        case .education: return "graduationcap.fill"
        case .events: return "party.popper.fill"
        case .flowers: return "camera.macro"
        case .pets: return "pawprint.fill"
        case .delivery: return "box.truck.fill"
        case .tattoo: return "drop.fill"
        case .astrology: return "moon.stars.fill"
        }
    }
    
    /// Имя ассета для кастомной иконки (SVG)
    var assetName: String {
        "cat_\(rawValue)"
    }
    
    var color: String {
        switch self {
        case .beach: return "categoryBeach"
        case .restaurant: return "categoryRestaurant"
        case .cafe: return "categoryCafe"
        case .hotel: return "categoryHotel"
        case .temple: return "categoryTemple"
        case .museum: return "categoryMuseum"
        case .shopping: return "categoryShopping"
        case .nightlife: return "categoryNightlife"
        case .nature: return "categoryNature"
        case .entertainment: return "categoryEntertainment"
        case .transport: return "categoryTransport"
        case .medical: return "categoryMedical"
        case .service: return "categoryService"
        case .sight: return "categorySight"
        case .fastfood: return "categoryRestaurant" // Use existing restaurant color
        case .spa: return "tcPrimary"
        
        // Use a generic primary color for all service categories for now
        case .beauty, .hair, .health, .fitness, .photo_video, .legal_visa, .real_estate, .home_services, .tech_repair, .auto_moto, .kids, .education, .events, .flowers, .pets, .delivery, .tattoo, .astrology:
            return "tcPrimary"
        }
    }
}

/// Ценовой диапазон
enum PriceRange: String, Codable {
    case budget = "budget"
    case moderate = "moderate"
    case expensive = "expensive"
    case luxury = "luxury"
    
    var displayName: String {
        switch self {
        case .budget: return "$"
        case .moderate: return "$$"
        case .expensive: return "$$$"
        case .luxury: return "$$$$"
        }
    }
    
    var localizedName: String {
        switch self {
        case .budget: return "price_budget".localized
        case .moderate: return "price_moderate".localized
        case .expensive: return "price_expensive".localized
        case .luxury: return "price_luxury".localized
        }
    }
}

// MARK: - Discounts Models

/// Типы сортировки для скидок
enum DiscountSortType: String, CaseIterable, Identifiable {
    case rating = "sort_by_rating"
    case superDiscount = "super_discount"
    case discountSize = "sort_by_discount"
    
    var id: String { rawValue }
    
    var displayName: String {
        return rawValue.localized
    }
}
