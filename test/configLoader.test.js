const configLoader = require('../index');
const KmsDecrypter = require('../KmsDecrypter');


describe('Should return configuration decrypter configuration', () => {
    test('When ', async () => {
        KmsDecrypter.decrypt = jest.fn((key) => {
            return "password";
        });

        const config = await configLoader.getConfig({functionName: "test", invokedFunctionArn: ":"}, './test/config.json');

        expect(Object.keys(config).length).toBe(2)
    });
});