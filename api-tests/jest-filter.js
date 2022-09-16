module.exports = (testPaths) => ({
    filtered: testPaths
        .filter((path) => path.includes('/api-tests/'))
        .map((test) => ({
            test,
        })),
});
