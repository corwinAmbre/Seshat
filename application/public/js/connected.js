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
		saveVersion: function(id, version) {
			$.ajax({
				url: "/rest/project/version",
				data: {
					id: id,
					version: version
				},
				method: "POST"
			}).done(function(data) {

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
		}	
}

