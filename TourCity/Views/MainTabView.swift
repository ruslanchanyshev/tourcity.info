import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var loc: LocalizationManager
    @EnvironmentObject var navManager: NavigationManager
    
    enum Tab: String, CaseIterable {
        case map = "map"
        case guide = "guide"
        case discounts = "discounts"
        case services = "services"
        case settings = "settings"
        
        var icon: String {
            switch self {
            case .map: return "map.fill"
            case .guide: return "book.fill"
            case .discounts: return "percent"
            case .services: return "briefcase.fill"
            case .settings: return "gearshape.fill"
            }
        }
    }
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            TabView(selection: $navManager.selectedTab) {
                MapContainerView()
                    .tabItem {
                        Label("tab_map".localized, systemImage: Tab.map.icon)
                    }
                    .tag(Tab.map)
                
                GuideListView()
                    .tabItem {
                        Label("tab_guide".localized, systemImage: Tab.guide.icon)
                    }
                    .tag(Tab.guide)
                
                DiscountsListView()
                    .tabItem {
                        Label("tab_discounts".localized, systemImage: Tab.discounts.icon)
                    }
                    .tag(Tab.discounts)
                
                ServicesListView()
                    .tabItem {
                        Label("tab_services".localized, systemImage: Tab.services.icon)
                    }
                    .tag(Tab.services)
                
                SettingsView()
                    .tabItem {
                        Label("tab_settings".localized, systemImage: Tab.settings.icon)
                    }
                    .tag(Tab.settings)
            }
            .tint(Color.tcPrimary)
            
            // Global Persistent Logo - Round, anchored top-left
            Image("RCHLogo")
                .resizable()
                .scaledToFill()
                .scaleEffect(1.1) // Crop 10% from the perimeter by zooming in
                .frame(width: 36, height: 36) // 20% smaller than original 44x44
                .background(Circle().fill(Color.tcSurface))
                .clipShape(Circle())
                .shadow(color: Color.black.opacity(0.3), radius: 4, x: 0, y: 2)
                .overlay(Circle().stroke(Color.tcPrimary, lineWidth: 1.5))
                .padding(.leading, 12)
                .padding(.top, 4) // Anchored high, strictly under the clock
                .allowsHitTesting(false) // Don't block tab interaction
        }
        .task {
            // Запускаем проверку обновлений при старте (с учетом правила 3 дней)
            await UpdateService.shared.syncIfNeeded(dataManager: dataManager)
        }
    }
}

// MARK: - Discounts Views

struct DiscountsListView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var loc: LocalizationManager
    
    @State private var selectedCategory: POICategory? = nil
    @State private var sortType: DiscountSortType = .discountSize
    @State private var selectedPartner: POI? = nil
    
    // Категории, у которых есть хотя бы один партнер со скидкой
    var activeDiscountCategories: [POICategory] {
        let activeCats = Set(dataManager.discountPartners.map { $0.category })
        return POICategory.allCases.filter { activeCats.contains($0) }
    }
    
    // Сформированный список с учетом фильтрации и сортировки
    var filteredPartners: [POI] {
        var result = dataManager.discountPartners.filter { $0.isValidDiscount }
        
        // Фильтрация по категории
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        
        // Сортировка
        // Фильтрация и Сортировка
        switch sortType {
        case .rating:
            result.sort { ($0.rating ?? 0) > ($1.rating ?? 0) }
        case .superDiscount:
            // Фильтруем только те, где код 100 (скидка на весь чек)
            result = result.filter { $0.extraMetadata["ext_4"]?.trimmingCharacters(in: .whitespaces) == "100" }
            // Дополнительно сортируем по рейтингу
            result.sort { ($0.rating ?? 0) > ($1.rating ?? 0) }
        case .discountSize:
            result.sort { ($0.discount ?? 0) > ($1.discount ?? 0) }
        }
        
        return result
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.tcBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        
                        // Заголовок и Фильтры
                        VStack(alignment: .leading, spacing: 12) {
                            Text("discounts_title".localized)
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(Color.tcText)
                                .padding(.top, 60) // Место под логотип
                            
                            // Горизонтальный выбор категорий
                            ScrollView(.horizontal, showsIndicators: false) {
                                QHStack(spacing: 12) {
                                    filterButton(title: "filter_all".localized, isSelected: selectedCategory == nil) {
                                        selectedCategory = nil
                                    }
                                    
                                    ForEach(activeDiscountCategories) { category in
                                        filterButton(title: category.displayName, isSelected: selectedCategory == category) {
                                            selectedCategory = category
                                        }
                                    }
                                }
                                .padding(.vertical, 4)
                            }
                            
                            // Выбор сортировки
                            HStack {
                                
                                Picker("", selection: $sortType) {
                                    ForEach(DiscountSortType.allCases) { type in
                                        Text(type.displayName).tag(type)
                                    }
                                }
                                .pickerStyle(.segmented)
                                .scaleEffect(0.9)
                                .accentColor(sortType == .superDiscount ? Color.tcAccent : Color.tcPrimary)
                                .padding(2)
                                .background(sortType == .superDiscount ? Color.tcAccent.opacity(0.1) : Color.clear)
                                .cornerRadius(10)
                            }
                            .padding(.top, 4)
                            .animation(.spring(), value: sortType)
                        }
                        .padding(.horizontal)
                        
                        // Список карточек
                        LazyVStack(spacing: 16) {
                            ForEach(filteredPartners) { partner in
                                DiscountCardView(partner: partner, isSuperHighlight: sortType == .superDiscount)
                                    .onTapGesture {
                                        selectedPartner = partner
                                    }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 100)
                    }
                }
                .id(loc.currentLanguage) // Исправляем баг локализации: форсируем перерисовку при смене языка
            }
            .navigationBarHidden(true)
            .fullScreenCover(item: $selectedPartner) { partner in
                DiscountDetailView(partner: partner)
            }
        }
    }
    
    @ViewBuilder
    private func filterButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: isSelected ? .bold : .medium))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.tcPrimary : Color.tcSurface)
                .foregroundColor(isSelected ? .white : Color.tcText)
                .clipShape(Capsule())
                .shadow(color: Color.black.opacity(isSelected ? 0.2 : 0.05), radius: 4, x: 0, y: 2)
        }
    }
}

struct DiscountCardView: View {
    let partner: POI
    var isSuperHighlight: Bool = false
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon / Image placeholder
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSuperHighlight ? Color.tcAccent.opacity(0.2) : Color.tcPrimary.opacity(0.1))
                    .frame(width: 70, height: 70)
                
                CategoryIconView(category: partner.category, size: 28)
                    .foregroundColor(isSuperHighlight ? Color.tcAccent : Color.tcPrimary)
                
                if isSuperHighlight {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.white)
                        .padding(4)
                        .background(Color.tcAccent)
                        .clipShape(Circle())
                        .offset(x: 28, y: -28)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(partner.name)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color.tcText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                    
                    if partner.extraMetadata["ext_4"] == "100" && !isSuperHighlight {
                        Image(systemName: "star.bubble.fill")
                            .font(.system(size: 12))
                            .foregroundColor(Color.tcAccent)
                    }
                }
                
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.orange)
                    Text(String(format: "%.1f", partner.rating ?? 0.0))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color.tcTextSecondary)
                }
                
                Text(partner.category.displayName)
                    .font(.system(size: 12))
                    .foregroundColor(isSuperHighlight ? Color.tcAccent : Color.tcPrimary)
            }
            
            Spacer()
            
            // Discount Badge
            VStack(alignment: .trailing, spacing: 0) {
                Text("\(partner.discount ?? 0)%")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(isSuperHighlight ? Color.tcAccent : Color.tcPrimary)
                Text(isSuperHighlight ? "badge_super".localized : "badge_off".localized)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(isSuperHighlight ? Color.tcAccent : Color.tcPrimary.opacity(0.7))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background((isSuperHighlight ? Color.tcAccent : Color.tcPrimary).opacity(0.1))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isSuperHighlight ? Color.tcAccent.opacity(0.3) : Color.clear, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .padding(12)
        .background(isSuperHighlight ? Color.tcAccent.opacity(0.05) : Color.tcSurface)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isSuperHighlight ? Color.tcAccent.opacity(0.2) : Color.clear, lineWidth: 1)
        )
        .cornerRadius(16)
        .shadow(color: isSuperHighlight ? Color.tcAccent.opacity(0.1) : Color.black.opacity(0.05), radius: 10, x: 0, y: 5)
    }
}

struct BarcodeView: View {
    let code: String
    
    var body: some View {
        if let barcodeImage = BarcodeService.shared.generateBarcode(from: code) {
            VStack(spacing: 4) {
                Image(uiImage: barcodeImage)
                    .resizable()
                    .interpolation(.none)
                    .scaledToFit()
                    .padding(8)
                    .background(Color.white)
                    .cornerRadius(8)
                    .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                
                Text(code)
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundColor(Color.tcTextSecondary)
            }
        } else {
            EmptyView()
        }
    }
}

struct DiscountDetailView: View {
    let partner: POI
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        GeometryReader { geometry in
            let h = geometry.size.height
            let isSmallScreen = h < 700
            
            ZStack(alignment: .topTrailing) {
                // Background
                Color.tcBackground.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    Spacer(minLength: h * 0.05)
                    
                    // 1. Секция Заголовка (Адаптивная иконка + Название)
                    VStack(spacing: h * 0.02) {
                        ZStack {
                            Circle()
                                .fill(Color.tcPrimary.opacity(0.1))
                                .frame(width: isSmallScreen ? h * 0.1 : h * 0.12, 
                                       height: isSmallScreen ? h * 0.1 : h * 0.12)
                            
                            CategoryIconView(category: partner.category, size: isSmallScreen ? h * 0.04 : h * 0.05)
                                .foregroundColor(Color.tcPrimary)
                        }
                        
                        VStack(spacing: 4) {
                            Text(partner.name)
                                .font(.system(size: isSmallScreen ? 24 : 32, weight: .bold))
                                .foregroundColor(Color.tcText)
                                .multilineTextAlignment(.center)
                                .minimumScaleFactor(0.6)
                                .lineLimit(2)
                                .padding(.horizontal, 24)
                            
                            Text(partner.category.displayName)
                                .font(.system(size: isSmallScreen ? 14 : 16, weight: .bold))
                                .foregroundColor(Color.tcPrimary)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 4)
                                .background(Color.tcPrimary.opacity(0.1))
                                .clipShape(Capsule())
                        }
                    }
                    
                    Spacer(minLength: 10)
                    
                    // 2. Секция Скидки
                    VStack(spacing: 0) {
                        Text("\(partner.discount ?? 0)%")
                            .font(.system(size: isSmallScreen ? h * 0.08 : h * 0.1, weight: .black, design: .rounded))
                            .foregroundColor(Color.tcAccent)
                            .minimumScaleFactor(0.5)
                        
                        Text("discount_available".localized.uppercased())
                            .font(.system(size: isSmallScreen ? 12 : 16, weight: .bold))
                            .tracking(1.5)
                            .foregroundColor(Color.tcTextSecondary)
                            .minimumScaleFactor(0.8)
                        
                        if let extraInfo = partner.extraDiscountInfo, !extraInfo.isEmpty {
                            Text(extraInfo)
                                .font(.system(size: isSmallScreen ? 11 : 13, weight: .medium))
                                .foregroundColor(Color.tcAccent)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 6)
                                .background(Color.tcAccent.opacity(0.08))
                                .cornerRadius(8)
                                .padding(.top, 8)
                                .minimumScaleFactor(0.7)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer(minLength: 10)
                    
                    // 3. Секция Кода и Штрихкода (Карточка)
                    VStack(spacing: h * 0.02) {
                        VStack(spacing: 8) {
                            Text("discount_use_code".localized)
                                .font(.system(size: isSmallScreen ? 12 : 14))
                                .foregroundColor(Color.tcTextSecondary)
                            
                            Text("tourcity.info")
                                .font(.system(size: isSmallScreen ? 20 : 26, weight: .bold, design: .monospaced))
                                .foregroundColor(Color.tcPrimary)
                                .padding(.horizontal, 30)
                                .padding(.vertical, isSmallScreen ? 10 : 16)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(Color.tcPrimary, style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                                )
                        }
                        
                        BarcodeView(code: "0772960573")
                            .frame(height: isSmallScreen ? h * 0.08 : h * 0.11)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(Color.white)
                            .cornerRadius(12)
                    }
                    .padding(isSmallScreen ? 16 : 24)
                    .background(Color.tcSurface)
                    .cornerRadius(24)
                    .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 5)
                    .padding(.horizontal, 24)
                    
                    Spacer(minLength: 10)
                    
                    // 4. Секция Инструкций (низ)
                    VStack(spacing: 8) {
                        Text("discount_instruction".localized)
                            .font(.system(size: isSmallScreen ? 11 : 13))
                            .lineSpacing(2)
                            .foregroundColor(Color.tcTextSecondary)
                            .multilineTextAlignment(.center)
                            .minimumScaleFactor(0.8)
                            .padding(.horizontal, 30)
                        
                        if let expiryDate = partner.discountExpiryDate {
                            HStack(spacing: 4) {
                                Text("discount_valid_until".localized)
                                    .fontWeight(.medium)
                                Text(expiryDate.formattedString())
                                    .fontWeight(.bold)
                            }
                            .font(.system(size: isSmallScreen ? 11 : 12))
                            .foregroundColor(Color.tcAccent)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.tcAccent.opacity(0.1))
                            .cornerRadius(6)
                        }
                    }
                    
                    Spacer(minLength: h * 0.05)
                }
                .frame(width: geometry.size.width, height: geometry.size.height)
                
                // Кнопка закрытия
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color.tcText)
                        .padding(10)
                        .background(
                            Circle()
                                .fill(Color.tcSurface)
                                .shadow(color: Color.black.opacity(0.1), radius: 8)
                        )
                }
                .padding(.top, 20)
                .padding(.trailing, 20)
            }
        }
        .ignoresSafeArea(.keyboard)
    }
}

// Helper for horizontal alignment
struct QHStack<Content: View>: View {
    let spacing: CGFloat
    let content: Content
    
    init(spacing: CGFloat = 8, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.content = content()
    }
    
    var body: some View {
        HStack(spacing: spacing) {
            content
        }
    }
}
