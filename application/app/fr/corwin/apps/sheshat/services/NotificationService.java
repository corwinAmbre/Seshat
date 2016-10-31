package fr.corwin.apps.sheshat.services;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import play.Logger;
import play.Play;
import play.libs.F.Promise;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.play.plugins.mailgun.MailgunSender;
import fr.corwin.play.plugins.mailgun.forms.MailgunSendForm;

public class NotificationService {

	public static void sendEmailToAdmins(String subject, String html) {
		MailgunSendForm form = new MailgunSendForm();
		List<User> admins = User.find("byIsAdmin", true).fetch();
		List<String> adminMails = new ArrayList<String>();
		for (User admin : admins) {
			adminMails.add(admin.username);
		}
		form.to = adminMails;
		form.from = Play.configuration
				.getProperty("seshat.startup.admin.account");
		form.subject = subject;
		form.html = html;
		Promise<Boolean> sendResult = MailgunSender.send(form);
		try {
			sendResult.get();
		} catch (InterruptedException e) {
			Logger.error(e.getMessage());
		} catch (ExecutionException e) {
			Logger.error(e.getMessage());
		}

	}

}
