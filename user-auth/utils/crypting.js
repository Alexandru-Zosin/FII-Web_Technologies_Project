const crypto = require('crypto');

function hashWithKey(data, secretKey) { // HMAC-SHA256
    const hash = crypto.createHmac('sha256', secretKey);
    hash.update(data);
    return hmac.digest('hex');
}

function encrypt(data, secretKey) {
    const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex'); // ciphertext
    encryptedData += cipher.final('hex'); // completion of encryption
    return iv.toString('hex') + encryptedData;
}

function decrypt(encryptedData, secretKey) { // [128, 255, 0, 33] => 80, ff, 00, 21 (16bytes=>32chars)
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex'); // Extract IV from encrypted data
    const encryptedText = encryptedData.slice(32); // Extract the encrypted text
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8'); // completion of decryption
    return decryptedData;
}

module.exports = { hashWithKey, encrypt, decrypt };