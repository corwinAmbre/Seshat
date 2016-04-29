package controllers;

import fr.corwin.apps.sheshat.model.User;

public class Security extends Secure.Security {

	static boolean authenticate(String username, String password) {
		return User.connect(username, password);
	}

}
