package controllers;

import java.util.Collection;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Transformer;

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

}
