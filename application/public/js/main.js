/**
 * Wrapper method to decrypt a message encrypted using server side encryption.
 * Requires to load cryptojs/rollups/aes.js
 * @param keyBase64 key to use for encryption, in Base64
 * @param ivBase64 init vector to use for encryption, in Base64
 * @param encrypted encrypted message, in Base64
 * @returns Return the decrypted string if key matches, null otherwise
 *
 */
function decryptFromServer(keyBase64, ivBase64, encrypted) {
	var key = CryptoJS.enc.Base64.parse(keyBase64);
	var iv = CryptoJS.enc.Base64.parse(ivBase64);
	var result = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(
		encrypted,
		key, 
		{ mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: iv }));
	return result;
}

/**
 * Wrapper method to encrypt a message that will be decrypted using server side decryption.
 * Requires to load cryptojs/rollups/aes.js 
 * @param keyBase64 key to use for decryption, in Base64
 * @param ivBase64 init vector to use for decryption, in Base64
 * @param message string to encrypt (can be a JSON.stringify string)
 * @returns Return the encrypted message in Base64, null in case of issue while encrypting
 */
function encryptToServer(keyBase64, ivBase64, message) {
	var key = CryptoJS.enc.Base64.parse(keyBase64);
	var iv = CryptoJS.enc.Base64.parse(ivBase64);
	var result = CryptoJS.AES.encrypt(
		message,
		key, 
		{ mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: iv });
	return result.toString();
}

/**
 * Wrapper method to decrypt a vault when received from the server using client side decryption.
 * @param key key to use for decryption, in plain text. Will be padded to 32 characters automatically (or truncate if needed)
 * @param ivBase64 init vectore to user for decryption, in Base64
 * @param vault encrypted vault, in Base64
 * @returns Return vault as a JSON object if key matches, null otherwise
 */
function openVault(key, ivBase64, vault) {
	var padKey = key + "00000000000000000000000000000000";
	padKey = padKey.slice(0, 32);
	var keyBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(padKey));
	var decrypted = decryptFromServer(keyBase64, ivBase64, vault);
	return JSON.parse(decrypted);
}