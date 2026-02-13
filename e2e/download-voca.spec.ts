import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('should download vocabulary data when clicking the total data count', async ({ page }) => {
  // 1. Navigate to the app (including basePath)
  await page.goto('http://localhost:3000/holavoca/');

  // 2. Find the "전체 데이터" element using a partial text match and ensure it's clickable
  // Using filter with hasText to handle the nested strong tag
  const downloadTrigger = page.locator('div').filter({ hasText: '전체 데이터' }).first();
  await expect(downloadTrigger).toBeVisible();

  // 3. Set up a download listener
  const downloadPromise = page.waitForEvent('download');

  // 4. Click to download
  await downloadTrigger.click();

  const download = await downloadPromise;

  // 5. Verify filename format (오늘날짜-voca.json)
  const today = new Date().toISOString().split('T')[0];
  const expectedPrefix = `${today}-voca.json`;
  expect(download.suggestedFilename()).toBe(expectedPrefix);

  // 6. Save and verify content (optional but good)
  const downloadPath = path.join(__dirname, '..', 'test-results', download.suggestedFilename());
  await download.saveAs(downloadPath);
  
  const content = fs.readFileSync(downloadPath, 'utf-8');
  const data = JSON.parse(content);
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBe(730);
});
