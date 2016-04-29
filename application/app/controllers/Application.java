package controllers;

import play.mvc.Controller;
import play.mvc.With;
import fr.corwin.apps.sheshat.model.User;

@With(Secure.class)
public class Application extends Controller {

	public static void index() {
		User user = User.findByUsername(Security.connected());
		render(user);
	}

}