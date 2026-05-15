const axios = require('axios');
const fs = require('fs');

async function test() {
    const url = 'https://maps.app.goo.gl/m374iXv7c8vVjXyJA';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    try {
        const res = await axios.get(url, { headers, maxRedirects: 15 });
        console.log('Status:', res.status);
        console.log('Final URL:', res.request.res.responseUrl);
        fs.writeFileSync('debug_google.html', res.data);
        console.log('Saved to debug_google.html');
    } catch (e) {
        console.error(e.message);
    }
}

test();
