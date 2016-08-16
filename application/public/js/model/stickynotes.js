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

var StickyNoteWall = function(dom) {
	this.notes = new Array();
	this.lastId = 0;
	this.dom = dom;
	this.moving = null;
	var $this = this;
	$(this.dom).mouseup(function() {
		if($this.moving != null) {
			var id = parseInt($($this.moving).attr("id").substring("5"));
			var newX = ($($this.moving).offset().left + 0.0) / $($this.dom).width();
			var newY = ($($this.moving).offset().top + 0.0) / $($this.dom).height();
			$this.getNote(id).move(newX, newY);				
			$this.moving = null;
		}
	});
	$(this.dom).mousemove(function(event) {
		if($this.moving != null) {
			var newPos = {
				left: event.pageX - $($this.dom).offset().left - ($($this.moving).width() / 2),
				top: event.pageY - $($this.dom).offset().top - ($($this.moving).height() / 2)
			}
			$($this.moving).offset(newPos);
		}
	});
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

StickyNoteWall.prototype.getNote = function(id) {
	if(id == null) {
		return;
	}
	for(var i = 0; i < this.notes.length; i++) {
		if(this.notes[i].id == id) {
			return this.notes[i];
		}
	}
	return null;
}

StickyNoteWall.prototype.render = function() {
	if(this.dom == null) {
		return;
	}
	$(this.dom).empty();
	var $this = this;
	this.notes.forEach(function(note){
		var domNote = $("<div class='note' id='note_" + note.id + "'><div class='content'>" + note.content + "</div></div>");
		$(domNote).mousedown(function(e) {
			if($(e.target).hasClass("fa") ) {
				return;
			}
			if($(e.target).hasClass("note")) {
				$this.moving = e.target;
			} else {
				$this.moving = $(e.target).parents(".note");
			}
		});
		var buttons = $('<div class="noteButtons"></div>');
		var toggleButton = $('<i class="fa fa-chevron-down" title="Actions"></i>');
		$(toggleButton).click(function() {
			$(this).siblings(".innerButtons").slideToggle();
			if($(this).hasClass("fa-chevron-down")) {
				$(this).removeClass("fa-chevron-down");
				$(this).addClass("fa-chevron-up");
			} else {
				$(this).addClass("fa-chevron-down");
				$(this).removeClass("fa-chevron-up");
			}
		});
		$(buttons).append(toggleButton);
		// Stacking buttons
		var innerButtons = $('<div class="innerButtons"></div>');
		var stackButtonsDownFull = $('<i class="fa fa-step-backward" title="Send to back"></i>');
		$(stackButtonsDownFull).click(function() {
			$this.getNote(note.id).stackDown();
			$this.render();
		});
		$(innerButtons).append(stackButtonsDownFull);
		var stackButtonsDown = $('<i class="fa fa-caret-down" title="Send backward"></i>');
		$(stackButtonsDown).click(function() {
			$this.getNote(note.id).down();
			$this.render();
		});
		$(innerButtons).append(stackButtonsDown);
		var stackButtonsUp = $('<i class="fa fa-caret-up" title="Bring forward"></i>');
		$(stackButtonsUp).click(function() {
			$this.getNote(note.id).up();
			$this.render();
		});
		$(innerButtons).append(stackButtonsUp);
		var stackButtonsUpFull = $('<i class="fa fa-step-forward" title="Send to back"></i>');
		$(stackButtonsUpFull).click(function() {
			$this.getNote(note.id).stackTop();
			$this.render();
		});
		$(innerButtons).append(stackButtonsUpFull);
		// Remove note button
		var removeNote = $('<i class="fa fa-trash-o" title="Delete note"></i>');
		$(removeNote).click(function() {
			askConfirmation("Note \"" + note.content + "\" will be deleted, do you confirm lock?", "Delete note").pipe(function() {
				$this.removeNote(note.id);
				$this.render();
			});
		})
		$(innerButtons).append(removeNote);
		$(buttons).append(innerButtons);
		$(domNote).append(buttons);
		$(domNote).css("left", note.pos[0] * 100.0 + "%");
		$(domNote).css("top", note.pos[1] * 100.0 + "%");
		$(domNote).css("z-index", note.pos[2] + 200);
		$($this.dom).append(domNote);
	});
	
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