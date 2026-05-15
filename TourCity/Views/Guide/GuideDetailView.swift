import SwiftUI
import CoreLocation

struct GuideDetailView: View {
    let poi: POI
    var isService: Bool = false
    @EnvironmentObject var loc: LocalizationManager
    @EnvironmentObject var navManager: NavigationManager
    @Environment(\.dismiss) private var dismiss
    
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
                    
                    // Search Tags are now completely hidden from UI and used only for the search engine
                    
                    // Show on map button (only if coordinates are valid and it's not a service)
                    if !isService && (poi.latitude != 0.0 || poi.longitude != 0.0) {
                        showOnMapButton
                    }
                    
                    // Special Offer / Discount section
                    if poi.isValidDiscount {
                        discountSection
                    }
                    
                    // Nearest Event section (Only if event is scheduled)
                    if poi.hasEvent {
                        eventSection
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
    
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("label_description".localized)
                .font(.system(size: 12, weight: .bold))
                .tracking(1.0)
                .foregroundColor(Color.tcPrimary.opacity(0.7))
            
            Text(poi.description)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(Color.tcText)
                .lineSpacing(4)
        }
    }
    
    // MARK: - Details
    
    private var hasDetails: Bool {
        !(poi.address?.isEmpty ?? true) || 
        !(poi.phone?.isEmpty ?? true) || 
        !(poi.website?.isEmpty ?? true) || 
        !(poi.openingHours?.isEmpty ?? true)
    }
    
    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("label_information".localized)
                .font(.system(size: 12, weight: .bold))
                .tracking(1.0)
                .foregroundColor(Color.tcPrimary.opacity(0.7))
            
            VStack(spacing: 10) {
                if !isService, let address = poi.address, !address.isEmpty {
                    DetailRow(icon: "mappin.circle.fill", title: "label_address".localized, value: address, color: Color.tcPrimary)
                }
                if !isService, let phone = poi.phone, !phone.isEmpty {
                    DetailRow(icon: "phone.circle.fill", title: "label_phone".localized, value: phone, color: Color.tcNature)
                        .onTapGesture {
                            let cleanPhone = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
                            if let url = URL(string: "tel://\(cleanPhone)") {
                                UIApplication.shared.open(url)
                            }
                        }
                }
                if isService {
                    // 1. Instagram (website)
                    if let website = poi.website, !website.isEmpty {
                        DetailRow(icon: "camera.fill", title: "Instagram", value: website, color: Color.tcAccent)
                            .onTapGesture {
                                openInstagram(usernameOrURL: website)
                            }
                    }
                    
                    // 2. Telegram (ext_12)
                    if let tg = poi.extraMetadata["ext_12"], !tg.trimmingCharacters(in: .whitespaces).isEmpty {
                        DetailRow(icon: "paperplane.fill", title: "Telegram", value: "@\(tg.replacingOccurrences(of: "@", with: ""))", color: Color.tcPrimary)
                            .onTapGesture {
                                let username = tg.replacingOccurrences(of: "@", with: "")
                                if let url = URL(string: "https://t.me/\(username)") {
                                    UIApplication.shared.open(url)
                                }
                            }
                    }
                    
                    // 3. WhatsApp (phone)
                    if let phone = poi.phone, !phone.trimmingCharacters(in: .whitespaces).isEmpty {
                        DetailRow(icon: "message.fill", title: "WhatsApp", value: phone, color: Color.tcNature)
                            .onTapGesture {
                                let cleanPhone = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
                                if let url = URL(string: "https://wa.me/\(cleanPhone)") {
                                    UIApplication.shared.open(url)
                                }
                            }
                    }
                    
                    // 4. Portfolio (ext_1)
                    if let portfolio = poi.extraMetadata["ext_1"], !portfolio.trimmingCharacters(in: .whitespaces).isEmpty {
                        DetailRow(icon: "link", title: "Портфолио / Сайт", value: portfolio, color: Color.tcSecondary)
                            .onTapGesture {
                                let urlString = portfolio.hasPrefix("http") ? portfolio : "https://\(portfolio)"
                                if let url = URL(string: urlString) {
                                    UIApplication.shared.open(url)
                                }
                            }
                    }
                } else {
                    if let website = poi.website, !website.isEmpty {
                        DetailRow(icon: "globe", title: "label_website".localized, value: website, color: Color.tcAccent)
                            .onTapGesture {
                                let urlString = website.hasPrefix("http") ? website : "https://\(website)"
                                if let url = URL(string: urlString) {
                                    UIApplication.shared.open(url)
                                }
                            }
                    }
                }
                if let hours = poi.openingHours, !hours.isEmpty {
                    DetailRow(icon: "clock.fill", title: "label_opening_hours".localized, value: hours, color: Color.tcSecondary)
                }
            }
        }
    }
    
    // MARK: - Discount Section
    
    private var discountSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 16) {
                // Label & Expiry
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Image(systemName: "tag.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Color.tcAccent)
                        
                        Text("discount_available".localized)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(Color.tcText)
                    }
                    
                    if let expiry = poi.discountExpiryDate {
                        Text(expiry.localizedExpiryString())
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(Color.tcAccent.opacity(0.9))
                            .padding(.leading, 22) // Align with text, skipping icon
                    }
                }
                
                Spacer(minLength: 8)
                
                // Discount Badge
                Text(poi.isSpecialOffer ? "GIFT" : "\(poi.discount ?? 0)%")
                    .font(.system(size: poi.isSpecialOffer ? 20 : 32, weight: .black, design: .rounded))
                    .foregroundColor(Color.tcAccent)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
            }
            
            if let extra = poi.extraDiscountInfo {
                Text(extra)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color.tcTextSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        Color.tcAccent.opacity(0.06)
                    )
                    .cornerRadius(10)
            }
            
            // Additional custom info from ext_6 (e.g. "Only via Telegram")
            if let customInfo = poi.extraMetadata["ext_6"], !customInfo.trimmingCharacters(in: .whitespaces).isEmpty {
                Text(customInfo)
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(Color.tcTextSecondary.opacity(0.8))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .italic()
            }
        }
        .padding(18)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 22)
                    .fill(Color.tcSurface)
                
                // Subtle premium gradient
                RoundedRectangle(cornerRadius: 22)
                    .fill(
                        LinearGradient(
                            colors: [Color.tcAccent.opacity(0.04), .clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .stroke(
                    LinearGradient(
                        colors: [Color.tcAccent.opacity(0.25), Color.tcAccent.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1.5
                )
        )
        .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 6)
    }
    
    // MARK: - Event Section
    
    private var eventSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.tcNature.opacity(0.15))
                        .frame(width: 44, height: 44)
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color.tcNature)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("label_nearest_event".localized)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color.tcNature)
                        .textCase(.uppercase)
                        .tracking(0.5)
                    
                    Text(poi.eventName ?? "")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(Color.tcText)
                }
            }
            
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 20) {
                    if let date = poi.eventDate {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar")
                                .foregroundColor(Color.tcNature)
                            Text(date)
                        }
                    }
                    if let time = poi.eventTime {
                        HStack(spacing: 6) {
                            Image(systemName: "clock.fill")
                                .foregroundColor(Color.tcNature)
                            Text(time)
                        }
                    }
                }
                .font(.system(size: 14, weight: .bold))
                
                if let location = poi.eventLocation {
                    HStack(alignment: .top, spacing: 6) {
                        Image(systemName: "mappin.and.ellipse")
                            .foregroundColor(Color.tcNature.opacity(0.7))
                        Text(location)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color.tcTextSecondary)
                    }
                }
                
                if let conditions = poi.eventConditions {
                    Text(conditions)
                        .font(.system(size: 13))
                        .foregroundColor(Color.tcTextSecondary.opacity(0.8))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.tcNature.opacity(0.06))
                        .cornerRadius(8)
                }
            }
        }
        .padding(20)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color.tcSurface)
                RoundedRectangle(cornerRadius: 24)
                    .fill(LinearGradient(colors: [Color.tcNature.opacity(0.05), .clear], startPoint: .topLeading, endPoint: .bottomTrailing))
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(Color.tcNature.opacity(0.15), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 4)
    }
    
    // MARK: - Service Special Offer Section
    
    private var serviceSpecialOfferSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "gift.fill")
                    .font(.system(size: 16))
                    .foregroundColor(Color.tcAccent)
                
                Text("label_special_offer".localized)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color.tcText)
            }
            
            if let offer = poi.extraMetadata["ext_6"] {
                Text(offer)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color.tcTextSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(Color.tcAccent.opacity(0.06))
                    .cornerRadius(10)
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22)
                .fill(Color.tcSurface)
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 6)
        )
    }
    

    // MARK: - Actions
    
    private func openInstagram(usernameOrURL: String) {
        var urlString = usernameOrURL.trimmingCharacters(in: .whitespacesAndNewlines)
        
        if urlString.hasPrefix("http") {
            // Already a full URL
        } else if urlString.hasPrefix("@") {
            let username = String(urlString.dropFirst())
            urlString = "https://instagram.com/\(username)"
        } else {
            urlString = "https://instagram.com/\(urlString)"
        }
        
        if let url = URL(string: urlString) {
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
