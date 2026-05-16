import SwiftUI
import CoreLocation

struct GuideDetailView: View {
    let poi: POI
    var isService: Bool = false
    @EnvironmentObject var loc: LocalizationManager
    @EnvironmentObject var navManager: NavigationManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var showingDiscountDetail: Bool = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Hero header
                heroHeader
                
                // Content
                VStack(alignment: .leading, spacing: 20) {
                    // Quick info badges
                    quickInfoSection
                    
                    // Public Tags (Amenities)
                    if !poi.publicTags.isEmpty {
                        publicTagsSection
                    }
                    
                    // Discount Section
                    if poi.isValidDiscount {
                        discountSection
                    }
                    
                    // Events
                    if poi.eventName != nil && poi.hasEvent {
                        eventSection
                    }
                    
                    // Show on map button
                    if !isService {
                        showOnMapButton
                    }
                    
                    Divider()
                        .background(Color.tcDivider)
                    
                    // Description
                    descriptionSection
                    
                    // Details
                    if hasDetails {
                        Divider()
                            .background(Color.tcDivider)
                        detailsSection
                    }
                }
                .padding(20)
            }
        }
        .id(loc.currentLanguage)
        .background(Color.tcBackground)
        .ignoresSafeArea(edges: .top)
        .sheet(isPresented: $showingDiscountDetail) {
            DiscountDetailView(partner: poi)
        }
    }
    
    // MARK: - Hero Header
    
    private var heroHeader: some View {
        ZStack(alignment: .topTrailing) {
            ZStack(alignment: .bottomLeading) {
                // Gradient background — RCH gold tones
                LinearGradient(
                    colors: [
                        Color.tcPrimary.opacity(0.4),
                        Color.tcAccent.opacity(0.15),
                        Color.tcBackground
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 220)
                .overlay(
                    CategoryIconView(category: poi.category, size: 80)
                        .foregroundColor(Color.tcPrimary.opacity(0.12))
                        .offset(x: 80, y: -20)
                )
                
                // Title overlay
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(poi.category.displayName)
                            .font(.system(size: 12, weight: .bold))
                            .textCase(.uppercase)
                            .tracking(1.2)
                            .foregroundColor(Color.tcPrimary)
                        
                        if poi.isFeatured {
                            Label("label_featured".localized, systemImage: "star.fill")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(Color.tcPrimary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule()
                                        .fill(Color.tcPrimary.opacity(0.15))
                                )
                        }
                    }
                    
                    Text(poi.name)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(Color.tcText)
                }
                .padding(20)
            }
            
            // Custom Close Button
            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color.tcText)
                    .padding(10)
                    .background(
                        Circle()
                            .fill(Color.tcBackground.opacity(0.8))
                            .shadow(color: .black.opacity(0.1), radius: 4)
                    )
            }
            .padding(.top, 50)
            .padding(.trailing, 16)
        }
    }
    
    // MARK: - Public Tags
    
    private var publicTagsSection: some View {
        FlowLayout(spacing: 8) {
            ForEach(Array(poi.publicTags.enumerated()), id: \.offset) { index, tag in
                PublicTagView(text: tag, index: index)
            }
        }
        .padding(.vertical, 4)
    }
    
    // MARK: - Discount Section
    private var discountSection: some View {
        Button(action: { showingDiscountDetail = true }) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.2))
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: "tag.fill")
                        .foregroundColor(.white)
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("tab_discounts".localized)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Group {
                        if poi.isFullCheckDiscount {
                            Text("100% (\("label_full_check".localized))")
                        } else if poi.isSpecialOffer {
                            Text("label_gift_bonus".localized)
                        } else if let disc = poi.discount {
                            Text("\("label_discount".localized) \(disc)%")
                        }
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.white.opacity(0.7))
                    .font(.system(size: 14, weight: .bold))
            }
            .padding(16)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(LinearGradient(colors: [Color.tcAccent, Color.tcAccent.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing))
                    
                    Circle()
                        .fill(Color.white.opacity(0.1))
                        .frame(width: 100, height: 100)
                        .offset(x: 120, y: -40)
                }
                .clipShape(RoundedRectangle(cornerRadius: 16))
            )
            .shadow(color: Color.tcAccent.opacity(0.3), radius: 10, x: 0, y: 5)
        }
    }
    
    // MARK: - Navigation Button
    
    private var showOnMapButton: some View {
        Button(action: {
            dismiss() // Close the detail sheet first
            // Brief delay to ensure sheet starts closing before tab switches
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                navManager.showOnMap(poi)
            }
        }) {
            HStack(spacing: 12) {
                Image(systemName: "map.fill")
                    .font(.system(size: 18, weight: .bold))
                
                Text("show_on_map".localized)
                    .font(.system(size: 16, weight: .bold))
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .opacity(0.6)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.tcPrimary)
                    .shadow(color: Color.tcPrimary.opacity(0.3), radius: 8, x: 0, y: 4)
            )
            .foregroundColor(.white)
        }
    }
    
    // MARK: - Quick Info
    
    private var quickInfoSection: some View {
        HStack(spacing: 12) {
            if let rating = poi.rating {
                InfoBadge(
                    icon: "star.fill",
                    value: String(format: "%.1f", rating),
                    color: Color.tcPrimary
                )
            }
            
            if let price = poi.priceRange {
                InfoBadge(
                    icon: "dollarsign.circle.fill",
                    value: price.displayName,
                    color: Color.tcNature
                )
            }
            
            if poi.openingHours != nil {
                InfoBadge(
                    icon: "clock.fill",
                    value: "label_hours_badge".localized,
                    color: Color.tcAccent
                )
            }
            
            Spacer()
        }
    }
    
    // MARK: - Description
    
    @State private var isDescriptionExpanded: Bool = false
    
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("label_description".localized)
                .font(.system(size: 12, weight: .bold))
                .tracking(1.0)
                .foregroundColor(Color.tcPrimary.opacity(0.7))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(isDescriptionExpanded ? poi.description : String(poi.description.prefix(200)))
                    .font(.system(size: 15, weight: .regular))
                    .foregroundColor(Color.tcText)
                    .lineSpacing(4)
                
                if poi.description.count > 200 {
                    Button(action: { 
                        withAnimation(.spring(response: 0.3)) {
                            isDescriptionExpanded.toggle()
                        }
                    }) {
                        Text(isDescriptionExpanded ? "label_show_less".localized : "label_show_more".localized)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color.tcPrimary)
                            .padding(.top, 4)
                    }
                }
            }
        }
    }
    
    // MARK: - Details
    
    private var hasDetails: Bool {
        !(poi.address?.isEmpty ?? true) || 
        !(poi.call?.isEmpty ?? true) || 
        !(poi.phone?.isEmpty ?? true) || 
        !(poi.website?.isEmpty ?? true) || 
        !(poi.openingHours?.isEmpty ?? true) ||
        !(poi.inst?.isEmpty ?? true) ||
        !(poi.tg?.isEmpty ?? true) ||
        !(poi.wtsp?.isEmpty ?? true) ||
        !(poi.site?.isEmpty ?? true)
    }
    
    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("label_information".localized)
                .font(.system(size: 12, weight: .bold))
                .tracking(1.0)
                .foregroundColor(Color.tcPrimary.opacity(0.7))
            
            VStack(spacing: 10) {
                if let address = poi.address, !address.isEmpty && !isService {
                    DetailRow(icon: "mappin.circle.fill", title: "label_address".localized, value: address, color: Color.tcPrimary)
                }
                
                if isService {
                    compactContactsSection
                } else {
                    // 0. Call (Normal phone)
                    if let callNum = poi.call, !callNum.isEmpty {
                        Button(action: { openPhone(phone: callNum) }) {
                            DetailRow(icon: "phone.fill", title: "Телефон", value: callNum, color: Color.tcAccent)
                        }
                    }
                    
                    // 1. WhatsApp
                    if let wtsp = poi.wtsp, !wtsp.isEmpty {
                        Button(action: { openWhatsApp(phone: wtsp) }) {
                            DetailRow(icon: "message.fill", title: "WhatsApp", value: wtsp, color: Color.tcNature)
                        }
                    }
                    
                    // 2. Telegram
                    if let tg = poi.tg, !tg.isEmpty {
                        Button(action: { openTelegram(username: tg) }) {
                            DetailRow(icon: "paperplane.fill", title: "Telegram", value: "@\(tg.replacingOccurrences(of: "@", with: ""))", color: Color.tcPrimary)
                        }
                    }
                    
                    // 3. Instagram
                    if let inst = poi.inst, !inst.isEmpty {
                        Button(action: { openInstagram(usernameOrURL: inst) }) {
                            DetailRow(icon: "camera.fill", title: "Instagram", value: inst, color: Color.tcAccent)
                        }
                    }
                    
                    // 4. Website
                    if let site = poi.site, !site.isEmpty {
                        Button(action: { openURL(site) }) {
                            DetailRow(icon: "globe", title: "label_website".localized, value: site, color: Color.tcAccent)
                        }
                    }
                }
                
                if let hours = poi.openingHours, !hours.isEmpty {
                    DetailRow(icon: "clock.fill", title: "label_opening_hours".localized, value: hours, color: Color.tcSecondary)
                }
            }
        }
    }
    
    // MARK: - Event Section
    
    private var eventSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Image(systemName: "sparkles")
                    .foregroundColor(Color.tcAccent)
                    .font(.system(size: 18, weight: .bold))
                
                Text("label_upcoming_event".localized)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Color.tcText)
            }
            .padding(.bottom, 2)
            
            VStack(alignment: .leading, spacing: 16) {
                if let name = poi.eventName {
                    Text(name)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(Color.tcText)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                
                VStack(spacing: 12) {
                    if let date = poi.eventDate {
                        EventInfoRow(icon: "calendar", title: "label_event_date".localized, value: "\(date)\(poi.eventTime != nil ? " • \(poi.eventTime!)" : "")")
                    }
                    
                    if let loc = poi.eventLocation {
                        EventInfoRow(icon: "mappin.and.ellipse", title: "label_event_location".localized, value: loc)
                    }
                    
                    if let cond = poi.eventConditions {
                        EventInfoRow(icon: "info.circle", title: "label_event_conditions".localized, value: cond)
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.tcSurface)
                    .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 4)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.tcAccent.opacity(0.1), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Compact Contacts
    
    private var compactContactsSection: some View {
        HStack(spacing: 20) {
            if let callNum = poi.call, !callNum.isEmpty {
                Button(action: { openPhone(phone: callNum) }) {
                    compactContactIcon(icon: "phone.fill", color: Color.tcAccent)
                }
            }
            if let wtsp = poi.wtsp, !wtsp.isEmpty {
                Button(action: { openWhatsApp(phone: wtsp) }) {
                    compactContactIcon(icon: "message.fill", color: Color.tcNature)
                }
            }
            if let tg = poi.tg, !tg.isEmpty {
                Button(action: { openTelegram(username: tg) }) {
                    compactContactIcon(icon: "paperplane.fill", color: Color.tcPrimary)
                }
            }
            if let inst = poi.inst, !inst.isEmpty {
                Button(action: { openInstagram(usernameOrURL: inst) }) {
                    compactContactIcon(icon: "camera.fill", color: Color.tcAccent)
                }
            }
            if let site = poi.site, !site.isEmpty {
                Button(action: { openURL(site) }) {
                    compactContactIcon(icon: "globe", color: Color.tcAccent)
                }
            }
            Spacer()
        }
        .padding(.vertical, 8)
    }
    
    private func compactContactIcon(icon: String, color: Color) -> some View {
        Image(systemName: icon)
            .font(.system(size: 20))
            .foregroundColor(color)
            .frame(width: 44, height: 44)
            .background(
                Circle()
                    .fill(Color.tcSurface)
                    .shadow(color: color.opacity(0.15), radius: 5, x: 0, y: 2)
            )
    }
    
    // MARK: - Helper Functions
    
    private func openPhone(phone: String) {
        let cleanPhone = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        if let url = URL(string: "tel://\(cleanPhone)") {
            UIApplication.shared.open(url)
        }
    }
    
    private func openWhatsApp(phone: String) {
        let cleanPhone = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        if let url = URL(string: "whatsapp://send?phone=\(cleanPhone)") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else if let webUrl = URL(string: "https://wa.me/\(cleanPhone)") {
                UIApplication.shared.open(webUrl)
            }
        }
    }
    
    private func openTelegram(username: String) {
        let cleanName = username.replacingOccurrences(of: "@", with: "")
        if let url = URL(string: "tg://resolve?domain=\(cleanName)") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else if let webUrl = URL(string: "https://t.me/\(cleanName)") {
                UIApplication.shared.open(webUrl)
            }
        }
    }
    
    private func openInstagram(usernameOrURL: String) {
        if usernameOrURL.contains("/") {
            openURL(usernameOrURL)
        } else {
            let cleanName = usernameOrURL.replacingOccurrences(of: "@", with: "")
            if let url = URL(string: "instagram://user?username=\(cleanName)") {
                if UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url)
                } else if let webUrl = URL(string: "https://instagram.com/\(cleanName)") {
                    UIApplication.shared.open(webUrl)
                }
            }
        }
    }
    
    private func openURL(_ urlString: String) {
        let formattedUrl = urlString.hasPrefix("http") ? urlString : "https://\(urlString)"
        if let url = URL(string: formattedUrl) {
            UIApplication.shared.open(url)
        }
    }
}

// MARK: - Info Badge

struct InfoBadge: View {
    let icon: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(color)
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(Color.tcText)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(color.opacity(0.12))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(color.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Detail Row

struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 12))
                    .foregroundColor(Color.tcTextSecondary)
                Text(value)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color.tcText)
            }
            
            Spacer()
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.tcSurface)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.tcPrimary.opacity(0.08), lineWidth: 1)
                )
        )
    }
}

// MARK: - Public Tag View

struct PublicTagView: View {
    let text: String
    let index: Int
    
    // Palette for variety
    private let colors: [Color] = [
        Color.tcPrimary,
        Color.tcNature,
        Color.tcAccent,
        Color.tcSecondary,
        Color.tcBeach,
        Color.tcRestaurant,
        Color.tcCafe
    ]
    
    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(colors[index % colors.count])
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(colors[index % colors.count].opacity(0.12))
                    .overlay(
                        Capsule()
                            .stroke(colors[index % colors.count].opacity(0.3), lineWidth: 1)
                    )
            )
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            let point = result.points[index]
            subview.place(at: CGPoint(x: point.x + bounds.minX, y: point.y + bounds.minY),
                         proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var points: [CGPoint] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var rowHeight: CGFloat = 0
            
            for subview in subviews {
                let viewSize = subview.sizeThatFits(.unspecified)
                
                if x + viewSize.width > maxWidth, x > 0 {
                    x = 0
                    y += rowHeight + spacing
                    rowHeight = 0
                }
                
                points.append(CGPoint(x: x, y: y))
                rowHeight = max(rowHeight, viewSize.height)
                x += viewSize.width + spacing
                
                size.width = max(size.width, x)
            }
            
            size.height = y + rowHeight
        }
    }
}
// MARK: - Event Info Row

struct EventInfoRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            // Standardized Icon Column
            ZStack {
                Circle()
                    .fill(Color.tcAccent.opacity(0.12))
                    .frame(width: 32, height: 32)
                
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(Color.tcAccent)
            }
            .frame(width: 32) // Fixed width for vertical alignment
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 10, weight: .black))
                    .textCase(.uppercase)
                    .tracking(0.5)
                    .foregroundColor(Color.tcTextSecondary.opacity(0.6))
                
                Text(value)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(Color.tcText)
                    .lineSpacing(2)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
