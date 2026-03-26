const { test: setup, expect } = require('@playwright/test');
const path = require('path');
const LoginPage = require('../pages/loginPage');

const STORAGE_STATE = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const email = process.env.TAKEACTIVE_EMAIL || 'shahidahmad527@gmail.com';
    const password = process.env.TAKEACTIVE_PASSWORD || 'Onceuponatime123@';

    console.log('Authenticating once for all tests...');
    await loginPage.navigate();
    await loginPage.login(email, password);
    
    // Dismiss cookie banner if it exists
    const cookieBtn = page.getByRole('button', { name: 'Einverstanden' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    // Wait for the login to be successful (should land on dashboard or see a logout/profile button)
    // Here we wait for direct URL or card visibility
    await page.waitForTimeout(2000); // Small buffer for session cookies to settle
    
    await page.context().storageState({ path: STORAGE_STATE });
    console.log('Authentication state saved successfully.');
});
