import puppeteer from 'puppeteer';

export async function extractWebsite(url: string) {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Must start with http or https.');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extract UI Components (buttons, divs, sections, navbars)
    const components = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, div, section, nav, header, footer');
      return Array.from(elements).map((el, index) => ({
        name: `Component ${index + 1}`,
        html: el.outerHTML,
        code: el.outerHTML.replace(/\s+/g, ' ').trim(), // Minify HTML
      }));
    });

    await browser.close();
    return { components };
  } catch (error) {
    console.error('Puppeteer Extraction Error:', error);
    await browser.close();
    throw new Error('Failed to extract UI components.');
  }
}
