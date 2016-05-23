package controllers;

import play.mvc.Controller;
import fr.corwin.apps.sheshat.model.User;

public class Users extends Controller {

	public static void signup(String usernameSignup, String passwordSignup,
			String password2Signup) throws Throwable {
		if (User.createUser(usernameSignup, passwordSignup, password2Signup) != null) {
			session.put("username", usernameSignup);
			Security.authenticate(usernameSignup, passwordSignup);
			Application.index();
		}
	}

}
