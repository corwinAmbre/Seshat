package controllers;

import java.util.Collection;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.lang.StringUtils;

import play.i18n.Messages;
import play.mvc.Before;
import play.mvc.Controller;
import play.mvc.With;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.model.dto.UserDto;

@With(Secure.class)
@Check("administrator")
public class Administration extends Controller {

	@Before
	static void before() {
		User user = User.findByUsername(Security.connected());
		renderArgs.put("user", user);
	}

	public static void index() {
		render();
	}

	public static void getUsers() {
		List<User> users = User.findAll();
		Collection cleanedUsers = CollectionUtils.collect(users,
				new Transformer() {

					@Override
					public Object transform(Object arg0) {
						User u = (User) arg0;
						return new UserDto(u);
					}
				});
		renderJSON(cleanedUsers);
	}

	public static void lockUser(Long id) {
		User user = User.findById(id);
		if (user == null) {
			notFound(Messages.get("user.update.error.notfound"));
		} else {
			if (StringUtils.equals(user.username, Security.connected())) {
				error(Messages.get("user.update.error.unauthorizedself"));
			} else {
				user.lockUser();
				renderText("ok");
			}
		}
	}

	public static void unlockUser(Long id) {
		User user = User.findById(id);
		if (user == null) {
			notFound(Messages.get("user.update.error.notfound"));
		} else {
			user.unlockUser();
			renderText("ok");
		}
	}

}
