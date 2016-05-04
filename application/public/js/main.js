/**
 * Wrapper method to decrypt a message encrypted using server side encryption.
 * Requires to load cryptojs/rollups/aes.js
 * @param keyBase64 key to use for encryption, in Base64
 * @param ivBase64 init vector to use for encryption, in Base64
 * @param encrypted encrypted message, in Base64
 * @returns Return the decrypted string if key matches, null if any issue
 *
 */
function decryptFromServer(keyBase64, ivBase64, encrypted) {
	var key = CryptoJS.enc.Base64.parse(keyBase64);
	var iv = CryptoJS.enc.Base64.parse(ivBase64);
	try {
		var result = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(
			encrypted,
			key, 
			{ mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: iv }));
		if(result == '') {
			return null;
		}
		return result;
	} catch(err) {
		return null;
	}
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
	try {
		var result = CryptoJS.AES.encrypt(
			message,
			key, 
			{ mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: iv });
		if(result.toString() == '') {
			return null;
		}
		return result.toString();
	} catch(err) {
		return null;
	}
}

/**
 * Wrapper method to decrypt a vault when received from the server using client side decryption.
 * @param key key to use for decryption, in plain text. Will be padded to 32 characters automatically (or truncate if needed)
 * @param ivBase64 init vector to use for decryption, in Base64
 * @param vault encrypted vault, in Base64
 * @returns Return vault as a JSON object if key matches, null otherwise
 */
function openVault(key, ivBase64, vault) {
	var padKey = key + "00000000000000000000000000000000";
	padKey = padKey.slice(0, 32);
	var keyBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(padKey));
	var decrypted = decryptFromServer(keyBase64, ivBase64, vault);
	if(decrypted == null || decrypted == '') {
		return null;
	}
	return JSON.parse(decrypted);
}

/**
 * Wrapper method to save vault when a new project is added using client side encryption.
 * @param key key to use for encryption, in plain text. Will be padded to 32 characters automatically (or truncate if needed)
 * @param ivBase64 init vector to use for encryption, in Base64
 * @param vault vault to encrypt, as a JSON object
 * @returns Return encrypted vault in Base64
 */
function saveVault(key, ivBase64, vault) {
	var padKey = key + "00000000000000000000000000000000";
	padKey = padKey.slice(0, 32);
	var keyBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(padKey));
	return encryptToServer(keyBase64, ivBase64, JSON.stringify(vault));
}

/**
 * Generate a random key (256 bits) and iv (128 bits) given any passphrase 
 * @param secretPhrase Any string that will be used as seed to generate keys
 * @returns Object containing 2 fields: one "key" field containing a key encoded in base64 and one "iv" field contaiing an iv encoded in base64
 */
function generateKeyAndIv(secretPhrase) {
	 var salt = CryptoJS.lib.WordArray.random(128/8);
	 var key = CryptoJS.enc.Base64.stringify(CryptoJS.PBKDF2(secretPhrase, salt, { keySize: 256/32 }));
	 var iv = CryptoJS.enc.Base64.stringify(CryptoJS.PBKDF2(secretPhrase, salt, { keySize: 128/32 }));
	 return {key: key, iv: iv};
}

/**
 * Create a new project as a javascript object based on inputs provided in form 
 */
function createProject() {
	var projectName = $("#projectname").val();
	if(projectName === null || projectName.trim() == '') {
		// TODO display error message
		return;
	}
	var project = new Project(projectName);
	remoteCalls.createProject(project);
	return false;
}

function readCookie(name) {
	var cookies = document.cookie.split(";");
	for(var i=0; i < cookies.length; i++) {
		var cookie = cookies[i].split("=");
		if(cookie[0].trim() == name) {
			return cookie[1].trim();
		}
	}
	return null;
}

function writeCookie(name, value) {
	document.cookie = name + "=" + value;
}