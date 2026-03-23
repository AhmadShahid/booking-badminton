const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = 'input[name="email"]'; // Replace with actual selector
        this.passwordInput = 'input[name="password"]'; // Replace with actual selector
        this.loginButton = 'button[type="submit"]'; // Replace with actual selector
    }

    async navigate() {
        await this.page.goto('https://takeactive.com/login');
    }

    async login(username, password) {
        await this.page.fill(this.emailInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);
        await this.page.waitForURL('https://takeactive.com/dashboard'); // Ensure redirection
    }
}

module.exports = LoginPage;