module.exports = {
    use: {
        browserName: 'chromium',
        headless: !!process.env.CI, // Run in UI mode locally; headless in CI pipelines
        viewport: { width: 1280, height: 720 },
    },
    testDir: './tests',
    timeout: 60000,
    retries: 1,
    reporter: [['list']],
};