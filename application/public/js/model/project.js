var Scene = function() {
	this.content = "";
}

var Chapter = function(number) {
	this.number = number;
	this.content = [new Scene()];
}

var Project = function(name) {
	this.name = name;
	this.summary = "";
	this.chapters = [];
}

Project.prototype.addChapter = function() {
	var newChap = new Chapter(this.chapters.length + 1);
	this.chapters.push(newChap);
}