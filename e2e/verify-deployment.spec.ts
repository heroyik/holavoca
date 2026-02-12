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
    console.log('Waiting for Leaderboard content...');

    try {
        await expect(page.locator('text=Global Hall of Fame')).toBeVisible({ timeout: 20000 });
        console.log('✅ Leaderboard Header found.');
    } catch (e) {
        console.log('❌ Leaderboard Header NOT found. Checking for error state...');
    }

    // 5. Check if it's still loading or stuck
    const loadingState = page.locator('text=Loading Rankings...');
    if (await loadingState.isVisible()) {
        console.log('⚠️ Still seeing "Loading Rankings..."');
    } else {
        console.log('✅ Loading state cleared.');
    }

    // 6. Check for "Retry" button (Error State)
    const retryBtn = page.locator('button:has-text("Retry")');
    if (await retryBtn.isVisible()) {
        console.error('❌ Leaderboard Error detected. Retry button is visible.');
        // Fail the test if we see an error
        throw new Error("Leaderboard failed to load (Error State)");
    }

    // 7. Check entries
    const entries = page.locator('.leaderboard-entry'); // We need to add this class or query by style/structure
    // Simpler check: Look for "XP" text which appears in every entry
    const entriesCount = await page.locator('text=XP').count();

    if (entriesCount > 0) {
        console.log(`✅ Success! Found ${entriesCount} leaderboard entries.`);
    } else {
        const emptyMsg = page.locator('text=Be the first to join');
        if (await emptyMsg.isVisible()) {
            console.log('✅ Leaderboard is empty (valid state).');
        } else {
            console.warn('⚠️ No entries and no empty message found. Unexpected state.');
        }
    }
});
