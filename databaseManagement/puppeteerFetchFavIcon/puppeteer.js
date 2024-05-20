const fs = require('fs');
const puppeteer = require('puppeteer');

async function fetchFavicon(url, browser) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const favicon = await page.evaluate(() => {
        const iconLink = document.querySelector('link[rel*="icon"]');
        return iconLink ? iconLink.href : null;
    });

    if (!favicon) {
        console.log(`No favicon found for ${url}`);
        await page.close();
        return null;
    }

    const response = await page.goto(favicon);
    const buffer = await response.buffer();
    const base64Favicon = buffer.toString('base64');

    await page.close();
    return base64Favicon;
}

function timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
}

async function fetchFaviconWithTimeout(url, browser, ms) {
    try {
        return await Promise.race([fetchFavicon(url, browser), timeout(ms)]);
    } catch (error) {
        console.log(`Error fetching favicon for ${url}: ${error.message}`);
        return null;
    }
}

async function fetchFaviconsForUrls() {
    const browser = await puppeteer.launch();
    const data = require('../technologies.json');
    let updatedData = [];
    let count = 0;
    for (const item of data) {
        console.log('Processing item', count++);
        const base64Favicon = await fetchFaviconWithTimeout(item.url, browser, 5000);
        if (base64Favicon) {
            item.favicon = `data:image/png;base64,${base64Favicon}`;
        }
        updatedData.push(item);
    }

    fs.writeFileSync('technologies1.json', JSON.stringify(updatedData, null, 2));
    await browser.close();
}

fetchFaviconsForUrls().catch(console.error);
