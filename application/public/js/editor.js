var projectVue = new Vue({
	el: '#editor',
	data: project,
	methods: {
		goTo: function(number) {
			window.location.href= "#chapter_" + number;
		},
		contentUpdate: function(chapter, scene, event) {
			this.saved = false;
			var previousLength = this.chapters[chapter - 1 ].content[scene].content.length;
			this.chapters[chapter - 1 ].content[scene].content = $(event.target).html().trim();
			if(previousLength == 0 && this.chapters[chapter - 1 ].content[scene].content.length == 0) {
				if(event.keyCode == 8 || event.keyCode == 46) {
					var message = "&{'editor.messages.removescene.firstpart'} " + chapter + " &{'editor.messages.removescene.finalpart'}";
					var $this = this;
					askConfirmation(message, "&{'editor.messages.removescene.button'}").pipe(function() {
						$this.$data.chapters[chapter - 1].removeScene(scene + 1);
					});
				}
			}
		},
		pushToServer: function() {
			saveProjectVersion(this.$data);
			this.saved = true;
		},
		pushLocalVersions: function() {
			saveLocalVersions(this.$data.remoteId);
		},
		addChapter: function() {
			if(parseInt(this.$data.exportConfig.content.exportToChapter) == this.$data.chapters.length) {
				this.$data.exportConfig.content.exportToChapter = parseInt(this.$data.exportConfig.content.exportToChapter) + 1 ;
			}
			this.$data.addChapter();
		},
		removeChapter: function(chapter) {
			var message = "&{'editor.messages.removechapter.firstpart'} " + chapter + " &{'editor.messages.removechapter.secondpart'} " + this.chapters[chapter - 1].getWords() + " &{'editor.messages.removechapter.finalpart'}";
			var $this = this;
			askConfirmation(message, "&{'editor.messages.removechapter.button'}").pipe(function() {
				$this.$data.removeChapter(chapter);
			});
		},
		addScene: function(chapter) {
			this.chapters[chapter - 1].addScene();
		},
		getEpub: function() {
			var epub = new EpubBuilder(project);
			epub.build(function(result) {
				var clickEvent;
				var downloadButton = document.getElementById("download-epub");
				clickEvent = document.createEvent("MouseEvent");
				clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				downloadButton.href = URL.createObjectURL(result);
				if(project.exportConfig.exportFormat == null) {
					downloadButton.download = project.name + ".epub";
				} else {
					downloadButton.download = project.name + "." +  project.exportConfig.exportFormat;
				}
				downloadButton.dispatchEvent(clickEvent);
			});
			$("#outputConfig").css("display", "none");
		},
		showEpubConfig: function() {
			$("#outputConfig").css("display", "flex");
		},
		closeEpubConfig: function() {
			$("#outputConfig").css("display", "none");
		},
		showHistory: function() {
			$("#historyDialog").css("display", "flex");
		},
		closeHistory: function() {
			$("#historyDialog").css("display", "none");
		}
	},
	ready: function() {
		if(this.$data.chapters.length == 1 && this.$data.chapters[0].content.length == 1) {
			focusOnEditableContent("chapter_1_scene_0", 0);
			this.$data.saved = true;
		}
	}
});

window.onbeforeunload = function (e) {
    if(!project.saved) {
    	e.returnValue="&{'editor.messages.warningnotsaved'}";
    	return "&{'editor.messages.warningnotsaved'}";
    }
};