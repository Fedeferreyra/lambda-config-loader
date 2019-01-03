'use strict'
const fs = require('fs');
const KmsDecrypter = require('./KmsDecrypter');

let envConfig;

module.exports.getConfig = async (context, configFilePath) => {
    if (envConfig) {
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
        const config = JSON.parse(configJson.toString())
        const functionName = context.functionName
        const functionArn = context.invokedFunctionArn
        let alias = functionArn.split(":").pop()
        if (alias === functionName || alias === "") {
            alias = "LATEST"
        }
        envConfig = config[alias.toUpperCase()];
        envConfig = await decryptValues(envConfig);
        return envConfig;
    } catch (e) {
        console.error('Failed to get configuration.', e);
        throw e;
    }
};

const decryptValues = async (config) => {
    for (const property in config) {
        if (config.hasOwnProperty(property)) {
            if(Object.keys(config[property]).length > 1 && typeof config[property] !== 'string'){
                config[property] = await decryptValues(config[property])
            }else {
                if ((property.match('-kms')) !== null) {
                    const value = config[property];
                    const newProperty = property.slice(0, -4);
                    config[newProperty] = await KmsDecrypter.decrypt(value);
                    delete config[property]
                }
            }
        }
    }
    return config;
};
