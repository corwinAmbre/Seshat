/**************************************************************************************
* This file contains all javascript fallback methods of connect.js when disconnected. *
* All of their names are in a package "localCalls" to isolate them                    *
***************************************************************************************/

var localCalls = {
	saveVersion: function(id, version, words, chapters) {
		if (typeof(Storage) === "undefined") {
			errorMessage("Your browser does not support offline storage, please reconnect your browser to push your version on server.");
			return;
		}
		var now = new Date();
		// Check if localstorage exists
		if(localStorage.localVersions == null) {
			localStorage.setItem("localVersions", '{"versions":[]}');
		}
		var versions = JSON.parse(localStorage.localVersions);
		var localVersion = {
			timestamp: now,
			version: version,
			words: words,
			chapters: chapters
		};
		versions.versions.push(localVersion);
		localStorage.setItem("localVersions", JSON.stringify(versions));
		var nowStr = (now.getHours() < 10 ? ("0" + now.getHours()) : now.getHours()) + ":" + (now.getMinutes() < 10 ? ("0" + now.getMinutes()) : now.getMinutes()) + ":" + (now.getSeconds() < 10 ? ("0" + now.getSeconds()) : now.getSeconds()) +
			" " + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate()) + "/" + (now.getMonth() < 10 ? ("0" + now.getMonth()) : now.getMonth()) + "/" + now.getFullYear();
		$("#historyList tbody").append("<tr class=\"localVersion\">" +
				"<td>" + nowStr + "</td>" +
				"<td>" + chapters + "</td>" +
				"<td>" + words + "</td>" +
			"</tr>");
	},
	appendLocalVersions: function() {
		if (typeof(Storage) === "undefined" || localStorage.localVersions == null) {
			return;
		}
		var versions = JSON.parse(localStorage.localVersions);
		versions.versions.forEach(function(item) {
			var now = new Date(item.timestamp);
			var timestampStr = (now.getHours() < 10 ? ("0" + now.getHours()) : now.getHours()) + ":" + (now.getMinutes() < 10 ? ("0" + now.getMinutes()) : now.getMinutes()) + ":" + (now.getSeconds() < 10 ? ("0" + now.getSeconds()) : now.getSeconds()) +
			" " + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate()) + "/" + (now.getMonth() < 10 ? ("0" + now.getMonth()) : now.getMonth()) + "/" + now.getFullYear();
			$("#historyList tbody").append("<tr class=\"localVersion\">" +
					"<td>" + timestampStr + "</td>" +
					"<td>" + item.chapters + "</td>" +
					"<td>" + item.words + "</td>" +
				"</tr>");
		});
	}
	
}