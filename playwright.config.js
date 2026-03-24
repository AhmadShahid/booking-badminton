const path = require('path');

const STORAGE_STATE = path.join(__dirname, '.auth/user.json');

module.exports = {
    testDir: './tests',
    timeout: 60000,
    retries: 1,
    fullyParallel: true, // Enable parallel execution
    workers: process.env.CI ? 4 : undefined, // Increase workers in CI
    reporter: [['list']],
    use: {
        browserName: 'chromium',
        headless: !!process.env.CI,
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.js/,
        },
        {
            name: 'chromium',
            use: { 
                browserName: 'chromium',
                storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
        },
    ],
};