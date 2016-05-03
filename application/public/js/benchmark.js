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

function async(call_function) {
    setTimeout(function() {
    	console.log("Starting " + call_function.name);
    	call_function();
    	console.log("Ending " + call_function.name);
    }, 0);
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

function runBenchmarkAESCryptoLargeData() {
	var encryption50kTest = new Array();
	var encryption100kTest = new Array();
	var encryption200kTest = new Array();
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(loreIpsum50k, "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		encryption50kTest[i]= end - start;
	}
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(loreIpsum50k + loreIpsum50k, "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		encryption100kTest[i]= end - start;
	}
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(loreIpsum50k + loreIpsum50k + loreIpsum50k + loreIpsum50k, "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		encryption200kTest[i]= end - start;
	}
	$("#aesBenchmarkLargeDataResults").append("<table><thead><tr><th>Length</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>" +
			"<tr><td>50k words</td><td>" + mean(encryption50kTest) + "</td><td>" + median(encryption50kTest) + "</td><td>" + min(encryption50kTest) + "</td><td>" + max(encryption50kTest) + "</td></tr>" +
			"<tr><td>100k words</td><td>" + mean(encryption100kTest) + "</td><td>" + median(encryption100kTest) + "</td><td>" + min(encryption100kTest) + "</td><td>" + max(encryption100kTest) + "</td></tr>" +
			"<tr><td>200k words</td><td>" + mean(encryption200kTest) + "</td><td>" + median(encryption200kTest) + "</td><td>" + min(encryption200kTest) + "</td><td>" + max(encryption200kTest) + "</td></tr>" +
			"</tbody></table>");	
}


function convertToDataURLviaCanvas(url, callback, outputFormat){
    var img = new Image();
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null; 
    };
    img.src = url;
}

function runBenchmarkAESCryptoImage() {
	// Original image size: ~9 Mo
	// Output: ~11 Mo
	convertToDataURLviaCanvas("/public/images/photo-1447752875215-b2761acb3c5d.jpg", runBenchmarkAESCryptoImageAfterLoad, "image/jpeg");
}

function runBenchmarkAESCryptoImageAfterLoad(base64Img) {
	var encryptionImgTest = new Array();
	for(var i=0; i<10; ++i) {
		var start = new Date().getTime();
		var encrypted = CryptoJS.AES.encrypt(base64Img, "Secret Passphrase");
		var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
		var end = new Date().getTime();
		encryptionImgTest[i]= end - start;
	}
	$("#aesBenchmarkImageResults").append("<table><thead><tr><th>Length</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>" +
			"<tr><td>Image 9Mo</td><td>" + mean(encryptionImgTest) + "</td><td>" + median(encryptionImgTest) + "</td><td>" + min(encryptionImgTest) + "</td><td>" + max(encryptionImgTest) + "</td></tr>" +
			"</tbody></table>");	
}

function runBenchmarkLZMA() {
	var compressionlzString = new Array();
	var decompressionlzString = new Array();
	var sourceString = JSON.stringify(dataAES);
	var initialSize = sourceString.length;
	var compressedSizelzString = 0;
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var compressed = LZString.compress(sourceString);
		var end = new Date().getTime();
		compressedSizelzString = compressed.length;
		compressionlzString[i] = end - start;
		start = new Date().getTime();
		LZString.decompress(compressed);
		end = new Date().getTime();
		decompressionlzString[i] = end - start;
	}
	$("#compressionBenchmarkResults").append("<strong>Default object</strong><br/>" + 
				"Initial text size: " + initialSize + "<br/>" +
				"LZString compressed size: " + compressedSizelzString + " - " + (compressedSizelzString / initialSize * 100).toFixed(2) + "%<br/>");
	$("#compressionBenchmarkResults").append("<table><thead><tr><th>Length</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>" +
			"<tr><td>Compression LZString</td><td>" + mean(compressionlzString) + "</td><td>" + median(compressionlzString) + "</td><td>" + min(compressionlzString) + "</td><td>" + max(compressionlzString) + "</td></tr>" +
			"<tr><td>Decompression LZString</td><td>" + mean(decompressionlzString) + "</td><td>" + median(decompressionlzString) + "</td><td>" + min(decompressionlzString) + "</td><td>" + max(decompressionlzString) + "</td></tr>" +
			"</tbody></table>");
	compressionlzString = new Array();
	decompressionlzString = new Array();
	sourceString = JSON.stringify(loreIpsum50k) + JSON.stringify(loreIpsum50k) + JSON.stringify(loreIpsum50k);
	initialSize = sourceString.length;
	compressedSizelzString = 0;
	for(var i=0; i<100; ++i) {
		var start = new Date().getTime();
		var compressed = LZString.compress(sourceString);
		var end = new Date().getTime();
		compressedSizelzString = compressed.length;
		compressionlzString[i] = end - start;
		start = new Date().getTime();
		LZString.decompress(compressed);
		end = new Date().getTime();
		decompressionlzString[i] = end - start;
	}
	$("#compressionBenchmarkResults").append("<strong>Large text</strong><br/>" + 
				"Initial text size: " + initialSize + "<br/>" +
				"LZString compressed size: " + compressedSizelzString + " - " + (compressedSizelzString / initialSize * 100).toFixed(2) + "%<br/>");
	$("#compressionBenchmarkResults").append("<table><thead><tr><th>Length</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>" +
			"<tr><td>Compression LZString</td><td>" + mean(compressionlzString) + "</td><td>" + median(compressionlzString) + "</td><td>" + min(compressionlzString) + "</td><td>" + max(compressionlzString) + "</td></tr>" +
			"<tr><td>Decompression LZString</td><td>" + mean(decompressionlzString) + "</td><td>" + median(decompressionlzString) + "</td><td>" + min(decompressionlzString) + "</td><td>" + max(decompressionlzString) + "</td></tr>" +
			"</tbody></table>");	
}