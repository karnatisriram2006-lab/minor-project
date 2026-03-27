const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    // Capture page errors (unhandled exceptions)
    page.on('pageerror', error => {
        console.log('PAGE EXCEPTION:', error.message);
        console.log('TRACE:', error.stack);
    });

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (err) {
        console.log('Goto Error:', err.message);
    }

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
