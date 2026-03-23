const { expect } = require('@playwright/test');

class DashboardPage {
    constructor(page) {
        this.page = page;
        this.badmintonCardLocator = 'img[alt="VfB Kiefholz, Badminton, all members"]'; // Replace with actual correct selector
    }

    async clickBadmintonCard() {
        await this.page.waitForSelector(this.badmintonCardLocator);
        await this.page.click(this.badmintonCardLocator);
        await this.page.waitForURL('https://takeactive.com/badminton-treptow');
    }
}

module.exports = DashboardPage;