package fr.corwin.apps.sheshat.jobs;

import java.io.File;

import play.Logger;
import play.Play;
import play.jobs.Job;
import play.jobs.OnApplicationStart;
import fr.corwin.apps.sheshat.model.User;

@OnApplicationStart
public class StartupJob extends Job {

	public void doJob() {
		// Create folders if needed according to configuration
		File versionsDirectory = new File(
				Play.configuration.getProperty("seshat.paths.versions"));
		if (!versionsDirectory.exists()) {
			if (!versionsDirectory.mkdirs()) {
				Logger.error("Impossible to create folder %s",
						Play.configuration.getProperty("seshat.paths.versions"));
			}
		}
		if (!versionsDirectory.isDirectory()) {
			Logger.error("%s is expected to be a folder but is a file",
					Play.configuration.getProperty("seshat.paths.versions"));
		}
		if (User.count() == 0) {
			new User("admin", "admin").save();
		}
	}
}
