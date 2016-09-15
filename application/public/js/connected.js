/***********************************************************************************
* This file contains all javascript methods that requires to be connected to work. *
* All of their names are in a package "remoteCalls" to isolate them                *
************************************************************************************/

var remoteCalls = {
		createProject: function(project, vault, version) {
			$.ajax({
				url: "rest/project", 
				data: {
					name: project.name,
					key: project.key,
					vault: vault,
					firstVersion: version
				},
				method: "POST"
			}).done(function(data) {
				window.location.href="/project/" + data;
			}).fail(function() {
				errorMessage("Error while creating project on server");
			});
		},
		saveVersion: function(id, version, words, chapters) {
			$.ajax({
				url: "/rest/project/version",
				data: {
					id: id,
					version: version,
					words: words,
					chapters: chapters
				},
				method: "POST"
			}).done(function(data) {
				console.log(data);
				var now = new Date();
				var nowStr = (now.getHours() < 10 ? ("0" + now.getHours()) : now.getHours()) + ":" + (now.getMinutes() < 10 ? ("0" + now.getMinutes()) : now.getMinutes()) + ":" + (now.getSeconds() < 10 ? ("0" + now.getSeconds()) : now.getSeconds()) +
					" " + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate()) + "/" + (now.getMonth() < 10 ? ("0" + now.getMonth()) : now.getMonth()) + "/" + now.getFullYear();
				$("#quotameter").attr("value", data._1);
				$("#historyList tbody").append("<tr>" +
						"<td>" + nowStr + "</td>" +
						"<td>" + chapters + "</td>" +
						"<td>" + words + "</td>" +
						"<td>" + data._2 + "</td>" +
					"</tr>");
			}).fail(function() {
				errorMessage("Error while pushing version to the server");
			});
		},
		lockUser: function(id, source) {
			$.ajax({
				url: "/admin/user/" + id + "/lock",
				method: "PUT"
			}).done(function() {
				$(source).siblings(".fa-unlock").removeClass("hidden");
				$(source).addClass("hidden");
			}).fail(function(data) {
				errorMessage(data.responseText);
			});
		},
		unlockUser: function(id, source) {
			$.ajax({
				url: "/admin/user/" + id + "/unlock",
				method: "PUT"
			}).done(function() {
				$(source).siblings(".fa-lock").removeClass("hidden");
				$(source).addClass("hidden");
			}).fail(function(data) {
				errorMessage(data.responseText);
			});
		},
		updatePassword: function(currentPwd, newPwd, newPwd2) {
			$.ajax({
				url: "/rest/user/changepassword",
				method: "POST",
				data: {
					currentpwd: currentPwd,
					newpwd: newPwd,
					newpwd2: newPwd2
				}
			}).done(function() {
				successMessage("Password changed");
			}).fail(function(data) {
				errorMessage(data.responseText);
			});
		}
}

