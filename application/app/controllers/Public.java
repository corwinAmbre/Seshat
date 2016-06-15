package controllers;

import org.apache.commons.lang.StringUtils;

import play.mvc.Controller;
import fr.corwin.apps.sheshat.model.User;

public class Public extends Controller {

	public static void index() {
		String username = Security.connected();
		User user = null;
		if (StringUtils.isNotEmpty(username)) {
			user = User.findByUsername(username);
		}
		render(user);
	}

}
