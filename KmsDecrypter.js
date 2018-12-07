'use strict'
const AWS = require('aws-sdk');

module.exports.decrypt = (key) => {
    return new Promise((resolve, reject) => {
        const kms = new AWS.KMS();
        console.log('Attempting to decrypt: ' + key);
        const params = {CiphertextBlob: new Buffer(key, 'base64')};
        console.log(params);
        kms.decrypt(params, function (err, data) {
            if (err) {
                console.log('Error while decrypting key: ' + err);
                reject(err)
            } else {
                console.log('Decrypted key');
                resolve(data.Plaintext.toString('ascii'));
            }
        });
    });
};