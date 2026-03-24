const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const DashboardPage = require('../pages/dashboardPage');
const BadmintonPage = require('../pages/badmintonPage');

// Helper to parse slots from environment variable
const getSlotsToBook = () => {
    const rawSlots = process.env.SLOTS_TO_BOOK;
    if (!rawSlots) {
        // Default slots if none provided
        return [
            { name: 'VfB Kiefholz', locator: 'text=FRIEDRICHSHAIN, play Badminton, level: from mid advanced, Fri 20:00-22:00' },
            { name: 'BaumschulenWEG', locator: 'text=BaumschulenWEG, play Badminton, all levels, Fri 19:30-22:00' }
        ];
    }

    try {
        // Try parsing as JSON array of strings or objects
        const parsed = JSON.parse(rawSlots);
        return Array.isArray(parsed) ? parsed.map(s => typeof s === 'string' ? { name: s, locator: s } : s) : [];
    } catch (e) {
        // Fallback to comma-separated strings
        return rawSlots.split(',').map(s => ({ name: s.trim(), locator: s.trim() }));
    }
};

const slots = getSlotsToBook();

test.describe('Automated Badminton Slot Booking', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    for (const slot of slots) {
        test(`Book slot: ${slot.name}`, async () => {
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            const email = process.env.TAKEACTIVE_EMAIL || 'shahidahmad527@gmail.com';
            const password = process.env.TAKEACTIVE_PASSWORD || 'Onceuponatime123@';

            console.log(`Starting booking for: ${slot.name}`);
            
            // Step 1: Login
            console.log('Navigating to Login Page');
            await loginPage.navigate();
            console.log('Entering Credentials');
            await loginPage.login(email, password);

            // Step 2: Navigate to Badminton Dashboard
            console.log('Navigating to Badminton Dashboard');
            await dashboardPage.clickBadmintonCard();

            // Step 3: Select the Slot
            console.log(`Selecting Slot: ${slot.locator}`);
            await page.waitForSelector(slot.locator, { timeout: 15000 });
            await page.click(slot.locator);
            
            // Wait for detail page or response
            await page.waitForResponse(
                (response) => response.url().includes('badminton-treptow/') && response.status() === 200,
                { timeout: 10000 }
            ).catch(() => console.log('Response wait timed out, continuing...'));

            // Step 4: Book the slot or confirm it's already booked
            const teilnehmenBtn = page.getByRole('button', { name: 'Teilnehmen' });
            const stornierenBtn = page.getByRole('button', { name: 'Stornieren' });

            // Wait until one of the buttons is visible
            console.log('Checking booking state on detail page...');
            await expect(teilnehmenBtn.or(stornierenBtn)).toBeVisible({ timeout: 15000 });

            const alreadyBooked = await stornierenBtn.isVisible();

            if (alreadyBooked) {
                console.log(`Slot "${slot.name}" is already booked (Stornieren button found).`);
            } else {
                console.log(`Booking "${slot.name}" (clicking Teilnehmen)`);
                await teilnehmenBtn.click();

                // Validate booking succeeded by checking button changed to "Stornieren"
                console.log('Validating booking succeeded...');
                await expect(stornierenBtn).toBeVisible({ timeout: 10000 });
                console.log(`SUCCESS: Slot "${slot.name}" is now booked.`);
            }
        });
    }
});