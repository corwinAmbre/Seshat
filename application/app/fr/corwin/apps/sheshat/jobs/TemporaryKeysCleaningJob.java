package fr.corwin.apps.sheshat.jobs;

import java.util.Calendar;

import play.Play;
import play.jobs.Job;
import fr.corwin.apps.sheshat.model.TemporaryKey;

/**
 * This job will delete TemporaryKeys that are older than an amount of time
 * (configured in application.conf) These keys are meant to be used immediately
 * for login purposes only so they don't need to be stored longer
 *
 */
public class TemporaryKeysCleaningJob extends Job {

	public void doJob() {
		String property = Play.configuration.getProperty(
				"seshat.security.temporarykeys.validity", "10");
		Integer timeout = Integer.parseInt(property);
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.MINUTE, -timeout);
		TemporaryKey.delete("byCreationDateLessThanEquals", cal.getTime());
	}

}
