const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const DashboardPage = require('../pages/dashboardPage');
const BadmintonPage = require('../pages/badmintonPage');

test.describe('Book a Badminton Slot at VfB Kiefholz', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Book the Friday Slot @ VfB Kiefholz', async () => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const badmintonPage = new BadmintonPage(page);

        const email = process.env.TAKEACTIVE_EMAIL || 'shahidahmad527@gmail.com';
        const password = process.env.TAKEACTIVE_PASSWORD || 'Onceuponatime123@';

        // Step 1: Login
        await loginPage.navigate();
        await loginPage.login(email, password);

        // Step 2: Navigate to Badminton Dashboard
        await dashboardPage.clickBadmintonCard();

        // Step 3: Select the Friday Slot
        const vfbKiefholzSlotLocator = 'text=FRIEDRICHSHAIN, play Badminton, level: from mid advanced, Fri 20:00-22:00';
        await page.waitForSelector(vfbKiefholzSlotLocator);
        await page.click(vfbKiefholzSlotLocator);
        await page.waitForResponse((response) => response.url().includes('badminton-treptow/') && response.status() === 200);

        // Delay to observe the detail page
        await page.waitForTimeout(5000);

        // Expectation: Validate the slot detail page loads
        await expect(page).toHaveURL(/badminton-treptow\/\d+/);
    });
});

// New Suite for BaumschulenWEG Slot
test.describe('Book a Badminton Slot at BaumschulenWEG', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Book the Friday Slot @ BaumschulenWEG', async () => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const badmintonPage = new BadmintonPage(page);

        const email = process.env.TAKEACTIVE_EMAIL || 'shahidahmad527@gmail.com';
        const password = process.env.TAKEACTIVE_PASSWORD || 'Onceuponatime123@';

        // Step 1: Login
        console.log('Navigating to Login Page');
        await loginPage.navigate();

        console.log('Entering Credentials');
        await loginPage.login(email, password);

        // Step 2: Navigate to Badminton Dashboard
        console.log('Navigating to Badminton Dashboard');
        await dashboardPage.clickBadmintonCard();
        await page.screenshot({ path: 'debug-dashboard.png' });

        // Step 3: Select the Friday Slot @ BaumschulenWEG
        const baumschulenwegSlotLocator = 'text=BaumschulenWEG, play Badminton, all levels, Fri 19:30-22:00';
        console.log('Selecting BaumschulenWEG Slot');
        await page.waitForSelector(baumschulenwegSlotLocator, { timeout: 15000 }); // Timeout for waiting
        await page.click(baumschulenwegSlotLocator);
        await page.waitForResponse(
            (response) => response.url().includes('badminton-treptow/') && response.status() === 200
        );

        // Step 4: Book the slot or confirm it's already booked
        // Wait for either button to appear on the detail page
        const teilnehmenBtn = page.getByRole('button', { name: 'Teilnehmen' });
        const stornierenBtn = page.getByRole('button', { name: 'Stornieren' });

        // Wait until one of the buttons is visible
        await expect(teilnehmenBtn.or(stornierenBtn)).toBeVisible({ timeout: 15000 });

        const alreadyBooked = await stornierenBtn.isVisible();

        if (alreadyBooked) {
            console.log('Slot is already booked (Stornieren button found). Test passed.');
        } else {
            console.log('Booking the Slot (clicking Teilnehmen)');
            await teilnehmenBtn.click();

            // Validate booking succeeded by checking button changed to "Stornieren"
            console.log('Validating booking succeeded (waiting for Stornieren button)');
            await expect(stornierenBtn).toBeVisible({ timeout: 10000 });
            console.log('Booking confirmed — Stornieren button is now visible.');
        }
    });
});