package controllers;

import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.services.SecurityService;

public class Security extends Secure.Security {

	static boolean authenticate(String username, String password) {
		User user = User.connect(username, password);
		if (user != null) {
			String vault = SecurityService.decrypt(
					SecurityService.resizeKey(password), user.getVault()._2,
					user.getVault()._1);
			response.setCookie("vault", vault.replaceAll("\"", "'"));
			response.setCookie("masterKey", user.password);
			return true;
		} else {
			return false;
		}
	}

	static boolean check(String profile) {
		User user = User.findByUsername(Security.connected());
		if ("administrator".equals(profile)) {
			return user.getIsAdmin();
		} else {
			return false;
		}
	}

	static void onDisconnect() {
		response.removeCookie("vault");
		response.removeCookie("masterKey");
	}
}
