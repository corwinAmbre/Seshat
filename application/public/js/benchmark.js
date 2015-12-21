// Basic functions
function mean(arr) {
	var total = 0;
	for(var i=0; i<arr.length; ++i) {
		total += arr[i];
	}
	return total/arr.length;
}

function median(arr) {
	arr.sort(function(a, b){return a-b});
	return arr[arr.length / 2];
}

function min(arr) {
	arr.sort(function(a, b){return a-b});
	return arr[0];
}

function max(arr) {
	arr.sort(function(a, b){return a-b});
	arr.reverse()
	return arr[0];
}




function runBenchmarkAESCrypto() {
	// Tests are run 100 times in order to get relevant dataAES
	var fullEncryptionTest = new Array();
	var partialEncryptionTest = new Array();
	var fullEncryptionTreeTest = new Array();
	
	// Running the encryption / decryption of the full object as a JSON string. 
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(JSON.stringify(dataAES), "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		fullEncryptionTest[i]= end - start;
	}
	// Running the encryption / decryption only on a leaf
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(dataAES["data"][i]["scenes"], "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		partialEncryptionTest[i]= end - start;
	}
	// Encrypt / decrypt the full tree but only at leaf level
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		for(var j=0; j<100; ++j) {
			dataAES["data"][j]["scenes"] = CryptoJS.AES.encrypt(dataAES["data"][j]["scenes"], "Secret Passphrase");
		}
		for(var j=0; j<100; ++j) {
			dataAES["data"][j]["scenes"] = CryptoJS.AES.decrypt(dataAES["data"][j]["scenes"], "Secret Passphrase");
		}
		var end = new Date().getTime();
		fullEncryptionTreeTest[i]= end - start;
	}
	$("#aesBenchmarkResults").append("<table><thead><tr><th>Method</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>" +
			"<tr><td>Full tree encrypt / decrypt</td><td>" + mean(fullEncryptionTest) + "</td><td>" + median(fullEncryptionTest) + "</td><td>" + min(fullEncryptionTest) + "</td><td>" + max(fullEncryptionTest) + "</td></tr>" +
			"<tr><td>Leaf encrypt / decrypt</td><td>" + mean(partialEncryptionTest) + "</td><td>" + median(partialEncryptionTest) + "</td><td>" + min(partialEncryptionTest) + "</td><td>" + max(partialEncryptionTest) + "</td></tr>" +
			"<tr><td>Full tree encrypt / decrypt at leaf level</td><td>" + mean(fullEncryptionTreeTest) + "</td><td>" + median(fullEncryptionTreeTest) + "</td><td>" + min(fullEncryptionTreeTest) + "</td><td>" + max(fullEncryptionTreeTest) + "</td></tr>" +
			"</tbody></table>");
}