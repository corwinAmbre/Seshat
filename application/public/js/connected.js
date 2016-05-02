/***********************************************************************************
* This file contains all javascript methods that requires to be connected to work. *
* All of their names are in a package "remoteCalls" to isolate them                *
************************************************************************************/

var remoteCalls = {
		createProject: function(project) {
			$.ajax({
				url: "rest/project", 
				data: {
					name: project.name,
					key: project.key
				},
				method: "POST"
			}).done(function(data) {
				project.remoteId = data;
				var vault = localStorage.getItem("vault");
				if(vault == null) {
					vault = {};
				} else {
					vault = JSON.parse(vault);
				}
				vault[project.key] = generateKeyAndIv(project.key);
				localStorage.setItem("vault", JSON.stringify(vault));
				window.location.href="/project/" + data;
			}).fail(function() {
				
			});
		}
}
