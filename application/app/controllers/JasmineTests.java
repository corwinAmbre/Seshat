package controllers;

import org.apache.commons.codec.binary.StringUtils;

import play.Play;
import play.mvc.Before;
import play.mvc.Controller;
import fr.corwin.apps.sheshat.model.User;

public class JasmineTests extends Controller {

	/**
	 * This controller is only available in test context. For any other context,
	 * the interceptor will redirect user to notFound page
	 */
	@Before
	static void checkFrameworkID() {
		if (!StringUtils.equals("test", Play.id)) {
			notFound();
		}
	}

	public static void index() {
		if (User.count("byUsername", "jasmineTest") > 0) {
			((User) User.find("byUsername", "jasmineTest").first()).delete();
		}
		User tempUser = new User("jasmineTest", "password");
		render(tempUser);
	}

	public static void epub() {
		render();
	}

}
