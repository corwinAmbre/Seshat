package controllers;

import play.libs.F.Tuple;
import play.mvc.Controller;
import fr.corwin.apps.sheshat.model.User;

public class Users extends Controller {

	public static void signup(String usernameSignup, String passwordSignup,
			String password2Signup) throws Throwable {
		Tuple<User, String> createdUser = User.createUser(usernameSignup,
				passwordSignup, password2Signup);
		if (createdUser != null && createdUser._1 != null) {
			session.put("username", usernameSignup);
			Security.authenticate(usernameSignup, passwordSignup);
			Application.index();
		} else {
			flash.error(createdUser == null ? "error.generic.unexpected"
					: createdUser._2);
			Public.index();
		}
	}

}
