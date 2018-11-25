const fs = require('fs');
const KmsDecrypter = require('./KmsDecrypter');

let envConfig;

module.exports.getConfig = async (context, configFilePath) => {
    if (envConfig) {
        console.log('Retrieving already loaded config');
        return envConfig;
    }
    else {
        return await loadConfig(configFilePath, context);
    }
}

module.exports.getEnvConfig = () => {
    return envConfig;
}

const loadConfig = async(configFilePath, context) => {
    try {
        const configJson = fs.readFileSync(configFilePath);

        console.log("Successfully loaded config");
        const config = JSON.parse(configJson.toString())
        functionName = context.functionName
        functionArn = context.invokedFunctionArn
        alias = functionArn.split(":").pop()
        if (alias == functionName) {
            alias = "LATEST"
        }
        envConfig = config[alias];
        envConfig = await decryptEncrypetedValues(envConfig);
        return envConfig;
    } catch (e) {
        console.error('Failed to get configuration.', e);
        throw e;
    }
};

const decryptEncrypetedValues = async (envConfig) => {

    for (const property in envConfig) {
        if (envConfig.hasOwnProperty(property)) {
            if(('/-kms/gm'.exec(property)) !== null){
                const value = envConfig[property];
                const newProperty = property.slice(0, -4);
                const newValue = await KmsDecrypter.decrypt(value);
                envConfig[newProperty] = newValue;
                delete envConfig[property]

            }
        }
    }
    return envConfig;
};
