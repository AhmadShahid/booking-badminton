const { expect } = require('@playwright/test');

class BadmintonPage {
    constructor(page) {
        this.page = page;
        this.fridaySlotLocator = 'text=FRIEDRICHSHAIN, play Badminton, level: from mid advanced, Fri 20:00-22:00'; // Replace with actual selector
    }

    async clickFridaySlot() {
        await this.page.waitForSelector(this.fridaySlotLocator);
        await this.page.click(this.fridaySlotLocator);
        await this.page.waitForResponse((response) => response.url().includes('badminton-treptow/') && response.status() === 200);
    }
}

module.exports = BadmintonPage;