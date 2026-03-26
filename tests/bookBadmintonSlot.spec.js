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

    for (const slot of slots) {
        test(`Book slot: ${slot.name}`, async ({ page }) => {
            console.log(`[${slot.name}] Starting precision booking flow...`);
            
            // Step 1: Navigate to Badminton Dashboard early (Already logged in via setup)
            console.log(`[${slot.name}] Pre-navigating to Badminton Dashboard...`);
            await page.goto('https://takeactive.com/badminton-treptow/', { waitUntil: 'networkidle' }); 

            // Step 2: Select the Slot early
            console.log(`[${slot.name}] Selecting Slot: ${slot.locator}`);
            await page.waitForSelector(slot.locator, { timeout: 15000 });
            await page.click(slot.locator);
            
            // Wait for detail page to load
            await page.waitForURL(/badminton-treptow\/\d+/, { timeout: 10000 });
            console.log(`[${slot.name}] On-site at detail page. Waiting for 7 PM Berlin precision trigger...`);

            // Step 3: Precision Wait until exactly 7 PM Berlin
            await page.evaluate(async () => {
                const getBerlinTime = () => {
                    return new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Berlin"}));
                };

                const target = getBerlinTime();
                target.setHours(19, 0, 0, 0);

                return new Promise(resolve => {
                    let lastLoggedMessage = "";
                    const tick = () => {
                        const now = getBerlinTime();
                        const diff = target - now;
                        
                        if (diff <= 0) {
                            resolve(); // TRIGGER!
                        } else {
                            const secondsLeft = Math.ceil(diff / 1000);
                            const minutesLeft = Math.floor(secondsLeft / 60);
                            const msg = `Wait: ${minutesLeft}m ${secondsLeft % 60}s remaining...`;
                            
                            // Log every 60 seconds or if less than 10 seconds remaining
                            if (msg !== lastLoggedMessage && (secondsLeft % 60 === 0 || secondsLeft <= 10)) {
                                console.log(msg);
                                lastLoggedMessage = msg;
                            }

                            if (diff > 100) {
                                setTimeout(tick, 50); // High frequency check
                            } else {
                                // @ts-ignore
                                (window.setImmediate || setTimeout)(tick, 0); // Maximum precision for last 100ms
                            }
                        }
                    };
                    tick();
                });
            });

            console.log(`[${slot.name}] 🚀 7 PM HIT! Executing booking...`);

            // Step 4: Intensive refresh/check loop for the booking button
            const teilnehmenBtn = page.getByRole('button', { name: 'Teilnehmen' });
            const stornierenBtn = page.getByRole('button', { name: 'Stornieren' });

            // Since we were already on the page, the button might need a quick reload 
            // if it was disabled or hidden before 7 PM. 
            // Many sites update in-place or need a reload.
            let attempt = 0;
            while (attempt < 5) {
                const isStornieren = await stornierenBtn.isVisible();
                if (isStornieren) {
                    console.log(`[${slot.name}] Slot is already booked.`);
                    return;
                }

                const isTeilnehmen = await teilnehmenBtn.isVisible();
                if (isTeilnehmen) {
                    console.log(`[${slot.name}] Clicking "Teilnehmen" button!`);
                    await teilnehmenBtn.click();
                    break;
                }

                console.log(`[${slot.name}] Button not found yet, reloading page (Attempt ${attempt + 1})...`);
                await page.reload({ waitUntil: 'domcontentloaded' });
                attempt++;
            }

            // Final Validation
            await expect(stornierenBtn).toBeVisible({ timeout: 10000 });
            console.log(`[${slot.name}] ✅ SUCCESS: Slot is now booked.`);
        });
    }
});