var StickyNote = function(id, content) {
	this.id = id;
	this.content = content || "";
	this.pos = [0, 0, 0]; 
	// Pos is the position of the note with 3 variables:
	// x: horizontal position between 0 and 1. Left is 0
	// y: vertical position between 0 and 1. Top is 0
	// z: stacking order as a positive integer. 0  is the lowest level
	this.wall = null;
}

var StickyNoteWall = function() {
	this.notes = new Array();
	this.lastId = 0;
}

StickyNoteWall.prototype.addNote = function(content) {
	var newNote = new StickyNote(this.lastId, content);
	newNote.pos[2] = this.notes.length;
	newNote.wall = this;
	this.notes.push(newNote);
	this.lastId += 1;
	return newNote;
}

StickyNoteWall.prototype.removeNote = function(id) {
	var posNote = -1;
	var noteZ = -1;
	for(var i = 0; i < this.notes.length; i++) {
		if(this.notes[i].id == id) {
			posNote = i;
			noteZ = this.notes[i].pos[2];
			break;
		}
	}
	if(posNote >= 0) {
		this.notes.splice(posNote, 1);
		this.notes.forEach(function(note) {
			if(note.pos[2] > noteZ) {
				note.pos[2] -= 1;
			}
		});
		return true;
	}
	return false;
}

StickyNote.prototype.move = function(x, y) {
	this.pos[0] = x;
	this.pos[1] = y;
}

StickyNote.prototype.stackTop = function() {
	var currentZ = this.pos[2];
	this.wall.notes.forEach(function(note) {
		if(note.pos[2] > currentZ) {
			note.pos[2] -= 1;
		}
	});
	this.pos[2] = this.wall.notes.length - 1;
}

StickyNote.prototype.stackDown = function() {
	var currentZ = this.pos[2];
	this.wall.notes.forEach(function(note) {
		if(note.pos[2] < currentZ) {
			note.pos[2] += 1;
		}
	});
	this.pos[2] = 0;
}

StickyNote.prototype.up = function() {
	var currentZ = this.pos[2];
	var $this = this;
	this.wall.notes.forEach(function(note) {
		if(note.pos[2] == (currentZ + 1)) {
			note.pos[2] -= 1;
			$this.pos[2] += 1;
		}
	});
}

StickyNote.prototype.down = function() {
	var currentZ = this.pos[2];
	var $this = this;
	this.wall.notes.forEach(function(note) {
		if(note.pos[2] == (currentZ - 1)) {
			note.pos[2] += 1;
			$this.pos[2] -= 1;
		}
	});
}