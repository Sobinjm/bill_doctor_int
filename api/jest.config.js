module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transformIgnorePatterns: [],
    testPathIgnorePatterns: [
        "/dist/"
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.js$": "ts-jest"
    }
};
