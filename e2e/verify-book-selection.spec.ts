
import { test, expect } from '@playwright/test';

test('Verify Textbook Selection Feature', async ({ page }) => {
    // 1. Visit the site
    await page.goto('http://localhost:3005/holavoca/', { waitUntil: 'domcontentloaded' });

    // 2. Check initial state (Vol 1 selected by default)
    // "Vocabulary Arsenal 547 📚"
    await expect(page.locator('text=Vocabulary Arsenal')).toContainText('547');
    console.log('✅ Initial state verified: 547 words');

    // 3. Click Vol 2 (Enable) -> Should be Vol 1 + Vol 2
    // "Vocabulary Arsenal 730 📚"
    await page.locator('img[alt="Book 2"]').click();
    await expect(page.locator('text=Vocabulary Arsenal')).toContainText('730');
    console.log('✅ Vol 2 enabled: 730 words');

    // 4. Click Vol 1 (Disable) -> Should be Vol 2 only
    // "Vocabulary Arsenal 183 📚"
    await page.locator('img[alt="Book 1"]').click();
    await expect(page.locator('text=Vocabulary Arsenal')).toContainText('183');
    console.log('✅ Vol 1 disabled: 183 words');

    // 5. Try to disable Vol 2 (Should be prevented, last book)
    await page.locator('img[alt="Book 2"]').click();
    await expect(page.locator('text=Vocabulary Arsenal')).toContainText('183');
    console.log('✅ Prevented disabling last book');
});
