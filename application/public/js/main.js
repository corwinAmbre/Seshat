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
	return decrypted;
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
	return encryptToServer(keyBase64, ivBase64, vault);
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
 * Always return false to prevent default behavior of button 
 */
function createProject() {
	// Check if project name exists
	var projectName = $("#projectname").val();
	if(projectName === null || projectName.trim() == '') {
		errorMessage("Empty project name");
		return false;
	}
	// Check if password is the correct one
	var password = $("#password").val();
	var masterKey = readCookie("masterKey");
	var sha256Password = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)
	if(sha256Password != masterKey) {
		errorMessage("Wrong password");
		return false;
	}
	// Create project object
	var project = new Project(projectName);
	project.addChapter();
	// Create an encryption key in the vault
	var vault = readVault();
	vault[project.key] = generateKeyAndIv(project.key);
	var b64Vault = writeVault(vault);
	// Prepare data for remote call //
	// Encrypt vault with password 
	var encryptedVault = saveVault(password, $("#ivVault").val(), b64Vault);
	/// Encrypt project with vault password
	var encryptedProject = encryptToServer(vault[project.key].key, vault[project.key].iv, JSON.stringify(project));
	remoteCalls.createProject(project, encryptedVault, encryptedProject);
	return false;
}

function saveProjectVersion(project) {
	var vault = readVault();
	if(vault[project.key] == null || vault[project.key].key == null || vault[project.key].iv == null) {
		errorMessage("No encryption key found for this project");
		return;
	}
	var encryptedProject = encryptToServer(vault[project.key].key, vault[project.key].iv, JSON.stringify(project));
	remoteCalls.saveVersion(project.remoteId, encryptedProject);
}

function prototypeProject(projectJson) {
	var result = Object.assign(new Project("tmp"), projectJson);
	result.chapters = new Array();
	projectJson.chapters.forEach(function(chapter) {
		var chap = Object.assign(new Chapter(chapter.number), chapter);
		chap.content = new Array();
		chapter.content.forEach(function(scene) {
			var sc = Object.assign(new Scene(), scene);
			chap.content.push(sc);
		});
		result.chapters.push(chap);
	});
	return result;
}

/**
 * Methods to handle cookies with JS. Cookies are only read on application domain. 
 */
/**
 * Read a cookie based on its name.
 * @param name String with cookie name
 * @returns if cookie exists, return the its value as a string, return null if cookie does not exist
 */
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

/**
 * Write a cookie. If cookie already exists, override the value
 * @param name Name of the cookie as a string
 * @param value Value to store as a string
 */
function writeCookie(name, value) {
	document.cookie = name + "=" + value;
}

/**
 * Wrapper to write vault into cookie. Vault is stored in base64 to avoid special characters
 * @param vault Vault as a JSON object
 * @returns String returns the initial object stringifyed and in base64
 */
function writeVault(vault) {
	var stringVault = JSON.stringify(vault);
	var words = CryptoJS.enc.Utf8.parse(stringVault);
	var b64Vault = CryptoJS.enc.Base64.stringify(words);
	writeCookie("vault", b64Vault);
	return b64Vault;
}

/**
 * Wrapper to read vault from cookie. 
 * @returns JSON object of the vault stored in cookie. If cookie does not exists or is empty, return an empty JSON object.
 */
function readVault() {
	var vault = readCookie("vault");
	if(vault == null || vault == "") {
		vault = {};
	} else {
		var words = CryptoJS.enc.Base64.parse(vault);
		var stringVault = CryptoJS.enc.Utf8.stringify(words);
		vault = JSON.parse(stringVault);
	}
	return vault;
}

/**
 * Display an error message, used on result from ajax calls
 * @param message String to display as error message
 */
function errorMessage(message) {
	alert(message);
}

/**
 * Ask for a confirmation before an action
 * @param message Message to display in confirmation box as a String
 * @param confirmationLabel Message to display in action button - Not used for now
 * @returns true if user confirms action, false otherwise
 */
function askConfirmation(message, confirmationLabel) {
	return confirm(message);
}

function askInput(message) {
	return prompt(message);
}

function focusOnEditableContent(id, selectOption) {
	var node = $("#" + id).get(0);
	var isNodeEmpty = false;
	if(node.innerHTML.length == 0) {
		node.innerHTML = '\u00a0';
		isNodeEmpty = true;
	}
	var range = document.createRange();
	switch(selectOption) {
	case 0:
		range.selectNodeContents(node);
		var lastPos = range.endOffset;
		range.setStart(node, lastPos);
		range.setEnd(node, lastPos);
		break;
	case 1:
		range.selectNodeContents(node);
	}
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	if(isNodeEmpty) {
		document.execCommand('delete', false, null);
	}
}

/***********************
 * Admin JS function
 ***********************/

/**
 * Lock a user based on his ID
 */
function lockUser(source, id) {
	var username = $(source).parent().parent().find("td:first").html();
	if(askConfirmation("User \"" + username + "\" won't be able to login anymore, do you confirm lock?", "")) {
		remoteCalls.lockUser(id, source);
	}
}

/**
 * Unlock a user based on his ID
 */
function unlockUser(source, id) {
	var username = $(source).parent().parent().find("td:first").html();
	if(askConfirmation("User \"" + username + "\" will be reactivated, do you confirm unlock?", "")) {
		remoteCalls.unlockUser(id, source);
	}
}