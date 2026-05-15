const axios = require('axios');
const cheerio = require('cheerio');

/**
 * ScraperService V8.2: Splash-screen Resistant Hybrid Mode
 * Optimized for Google Maps short links (maps.app.goo.gl)
 */
class ScraperService {
    async parseGoogleMapsLink(url) {
        console.log(`[Parser V8.2] 🚀 Starting deep import for: ${url}`);
        
        try {
            // Step 1: Force Mobile Agent & Manual Redirect Check
            // Mobile Safari on iPhone is the "friendliest" UA for Google redirects
            const mobileAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1';
            
            let currentUrl = url;
            let finalUrl = url;
            let html = '';

            // Manual redirect following chain
            for (let i = 0; i < 5; i++) {
                const response = await axios.get(currentUrl, {
                    headers: { 'User-Agent': mobileAgent },
                    maxRedirects: 0, // We follow manually to catch EVERY hop
                    validateStatus: (status) => status < 400,
                    timeout: 8000
                }).catch(err => err.response); // Catch 302 as a response

                if (!response) break;

                // Handle HTTP Redirects (301, 302)
                if (response.status >= 300 && response.status < 400 && response.headers.location) {
                    currentUrl = new URL(response.headers.location, currentUrl).href;
                    finalUrl = currentUrl;
                    console.log(`[Parser V8.2] Redirect [${response.status}] -> ${currentUrl}`);
                    continue;
                }

                // If we get a 200, check the HTML for JS/Meta redirects
                html = response.data;
                const $ = cheerio.load(html);
                
                // Check for DurableDeepLinkUi (splash screen)
                const desktopLink = $('div[data-desktop-link]').attr('data-desktop-link');
                const metaRefresh = $('meta[http-equiv="refresh"]').attr('content')?.split('url=')[1];
                
                if (desktopLink) {
                   console.log(`[Parser V8.2] Found splash screen link -> ${desktopLink}`);
                   currentUrl = desktopLink;
                   continue;
                } else if (metaRefresh) {
                   console.log(`[Parser V8.2] Found meta refresh -> ${metaRefresh}`);
                   currentUrl = metaRefresh;
                   continue;
                }
                
                // If no redirect found, we are at the destination
                finalUrl = response.request.res.responseUrl || currentUrl;
                break;
            }

            console.log(`[Parser V8.2] 📍 Final Landing URL: ${finalUrl}`);

            // Step 2: Extract Data from URL (Highest Reliability)
            let lat = '0.0', lon = '0.0';
            let nameFromUrl = '';

            // Extract Name from URL path (/place/Name+Of+Place/...)
            const nameMatch = finalUrl.match(/\/place\/([^\/@]+)/);
            if (nameMatch) {
                nameFromUrl = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
            }

            // Extract Coordinates from URL patterns
            const coordPatterns = [
                /@(-?\d+\.\d+),(-?\d+\.\d+)/,
                /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
                /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
                /maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/
            ];

            for (const p of coordPatterns) {
                const m = finalUrl.match(p);
                if (m) { [lat, lon] = [m[1], m[2]]; break; }
            }

            // Step 3: Extract Details from Desktop HTML (Address, Phone)
            // If we have HTML from step 1, use it, otherwise fetch final as desktop
            const desktopAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
            
            // If we don't have the final HTML yet, or it's just a redirector page
            if (!html || html.includes('DurableDeepLinkUi')) {
                const desktopResponse = await axios.get(finalUrl, {
                    headers: { 
                        'User-Agent': desktopAgent,
                        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
                    },
                    timeout: 8000
                });
                html = desktopResponse.data;
            }

            const $ = cheerio.load(html);

            let name = $('meta[property="og:title"]').attr('content') || nameFromUrl || '';
            name = name.replace(/ · Google Maps/g, '').replace(/ - Google Maps/g, '').trim();

            const ogDesc = $('meta[property="og:description"]').attr('content') || '';
            const descParts = ogDesc.split(' · ');
            const address = descParts[0] || '';
            
            let phone = '';
            const phoneMatch = ogDesc.match(/\+?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{4,10}/);
            if (phoneMatch) phone = phoneMatch[0];

            // Emergency backup for coordinates (search the whole page source)
            if (lat === '0.0') {
               const geoMatch = html.match(/\[-?\d+\.\d+,-?\d+\.\d+\]/);
               if (geoMatch) {
                   const c = JSON.parse(geoMatch[0]);
                   [lat, lon] = [c[0].toString(), c[1].toString()];
               }
            }

            console.log(`[Parser V8.2] ✅ SUCCESS: ${name} | ${lat}, ${lon}`);

            return {
                name: name || 'Новое место',
                lat,
                lon,
                address: address || '',
                phone: phone || '',
                image: $('meta[property="og:image"]').attr('content') || '',
                originalUrl: url,
                finalUrl: finalUrl
            };

        } catch (error) {
            console.error('[Parser V8.2] ❌ FATAL SCRAPING ERROR:', error.message);
            throw new Error(`Не удалось извлечь данные. Проверьте ссылку.`);
        }
    }
}

module.exports = new ScraperService();
