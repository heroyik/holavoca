import { test, expect } from '@playwright/test';

test('Verify HolaVoca v1.1 Deployment', async ({ page }) => {
    // 1. Visit the deployed site
    console.log('Navigating to https://heroyik.github.io/holavoca/ ...');
    // Use domcontentloaded to avoid waiting for long-polling requests
    await page.goto('https://heroyik.github.io/holavoca/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 2. Check title and revision
    await expect(page).toHaveTitle(/HolaVoca/);

    // Check for Revision tag "R.1.1.3"
    const revisionTag = page.locator('text=R.1.1.3');
    await expect(revisionTag).toBeVisible({ timeout: 30000 });
    console.log('✅ Revision R.1.1.3 found.');

    // 3. Check Leaderboard
    console.log('Clicking LEADER tab...');
    // Ensure the tab is clickable
    await page.locator('text=LEADER').waitFor({ state: 'visible' });
    await page.locator('text=LEADER').click();

    // 4. Verify Leaderboard loads (check for "Global Hall of Fame")
    // It might show "Loading Rankings..." briefly
    console.log('Waiting for Leaderboard content...');
    await expect(page.locator('text=Global Hall of Fame')).toBeVisible({ timeout: 30000 });

    // 5. Verify no infinite loading "Loading Rankings..." should disappear
    await expect(page.locator('text=Loading Rankings...')).not.toBeVisible({ timeout: 30000 });

    console.log('✅ Leaderboard loaded successfully.');

    // 6. Check for "Retry" button
    const retryBtn = page.locator('button:has-text("Retry")');
    if (await retryBtn.isVisible()) {
        console.log('⚠️ Retry button is visible, initial load might have failed.');
        // Optional: Click retry and wait again?
        // await retryBtn.click();
        // await expect(page.locator('text=Global Hall of Fame')).toBeVisible({ timeout: 30000 });
    } else {
        console.log('✅ No error/retry state detected.');
    }

    // 7. Check if there are entries (top 10) OR "Be the first" message
    const entries = page.locator('text=XP'); // Crude check for XP text which appears in entries
    const emptyMessage = page.locator('text=Be the first to join');

    // Wait a bit for list rendering
    await page.waitForTimeout(2000);

    if (await entries.count() > 0 || await emptyMessage.isVisible()) {
        console.log('✅ Leaderboard data displayed.');
    } else {
        // It might be that entries take time to render
        console.log('⚠️ Leaderboard seems empty, double checking...');
        // Take screenshot for debugging if possible
        // await page.screenshot({ path: 'leaderboard-debug.png' });
    }
});
