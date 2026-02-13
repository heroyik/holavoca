import { test, expect } from '@playwright/test';

/**
 * Review Sync & Management Verification Test
 * 
 * This test verifies:
 * 1. Data loading from localStorage (simulating a "new device" with synced data)
 * 2. Mistake list rendering and mistake counts
 * 3. Individual mistake removal
 * 4. "Clear All" functionality
 */

test.describe('Review Feature Refinement', () => {
  const MOCK_STATS = {
    xp: 150,
    gems: 15,
    streak: 2,
    lastStudyDate: "2026-02-12",
    completedUnits: ["unit-1"],
    mistakes: {
      "abril": 3,
      "adiós": 1
    }
  };

  test.beforeEach(async ({ page }) => {
    // 1. Visit the app and clear storage
    await page.goto('http://localhost:3000/holavoca/');
    await page.evaluate(() => localStorage.clear());
    
    // 2. Set mock stats in localStorage to simulate a synced account
    await page.evaluate((stats) => {
      localStorage.setItem('holavoca_stats', JSON.stringify(stats));
    }, MOCK_STATS);
    
    // 3. Reload to let useGamification pick up the data
    await page.goto('http://localhost:3000/holavoca/');
    
    // 4. Wait for the gamification hook to initialize by checking for XP display
    await expect(page.locator('text=My Learning Aura')).toBeVisible({ timeout: 10000 });
  });

  test('should display correctly synced mistakes and counts', async ({ page }) => {
    // Navigate to Review tab
    await page.locator('nav >> text=REVIEW').click();

    // Verify header and count
    await expect(page.locator('text=2 palabras para repasar')).toBeVisible();

    // Verify words and their mistakes
    await expect(page.locator('text=abril')).toBeVisible();
    await expect(page.locator('text=3 errores')).toBeVisible();
    await expect(page.locator('text=adiós')).toBeVisible();
    await expect(page.locator('text=1 error')).toBeVisible();
  });

  test('should allow individual removal of a mistake', async ({ page }) => {
    await page.locator('nav >> text=REVIEW').click();

    // Find the trash icon next to "adiós" and click it
    // The structure is: <div>adiós</div> ... <button><TrashIcon/></button>
    const adiosRow = page.locator('div').filter({ hasText: /^adiós$/ }).locator('..').locator('..');
    const deleteButton = adiosRow.locator('button');
    await deleteButton.click();

    // Check if it disappeared
    await expect(page.locator('text=adiós')).not.toBeVisible();
    await expect(page.locator('text=1 palabra para repasar')).toBeVisible();

    // Verify localStorage was updated
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('holavoca_stats') || '{}'));
    expect(stats.mistakes['adiós']).toBeUndefined();
    expect(stats.mistakes['abril']).toBe(3);
  });

  test('should allow clearing all mistakes', async ({ page }) => {
    await page.locator('nav >> text=REVIEW').click();

    // Click "Borrar todo"
    // Mock the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Borrar todo")');

    // Verify empty state UI
    await expect(page.locator('text=¡Todo despejado!')).toBeVisible();

    // Verify localStorage
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('holavoca_stats') || '{}'));
    expect(stats.mistakes).toEqual({});
  });
});
