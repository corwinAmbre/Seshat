var Scene = function() {
	this.content = "";
}

var Chapter = function(number) {
	this.number = number;
	this.content = [new Scene()];
}

var Project = function(name) {
	var salt = CryptoJS.lib.WordArray.random(128/8);
	this.remoteId = null;
	this.key = CryptoJS.enc.Base64.stringify(CryptoJS.PBKDF2(name, salt, { keySize: 256/32 })); 
	this.name = name;
	this.summary = "";
	this.chapters = [];
}

Project.prototype.addChapter = function() {
	var newChap = new Chapter(this.chapters.length + 1);
	this.chapters.push(newChap);
}

Project.prototype.removeChapter = function(number) {
	if(number >= (this.chapters.length + 1) || number < 1) {
		return false;
	} else {
		this.chapters.splice(number - 1, 1);
		this.chapters.forEach(function(chapter, i) {
			chapter.number = i + 1;
		});
		return true;
	}
}