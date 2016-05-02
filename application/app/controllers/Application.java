package controllers;

import org.apache.commons.codec.binary.StringUtils;

import play.mvc.Before;
import play.mvc.Controller;
import play.mvc.With;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.User;

@With(Secure.class)
public class Application extends Controller {

	@Before
	static void before() {
		User user = User.findByUsername(Security.connected());
		renderArgs.put("user", user);
	}

	public static void index() {
		render();
	}

	public static void createProject(String name, String key) {
		User user = User.findByUsername(Security.connected());
		Project project = user.addProject(name, key);
		user.save();
		renderJSON(project.id);
	}

	public static void getProject(Long id) {
		Project project = Project.findById(id);
		if (project == null) {
			notFound();
		}
		if (!StringUtils.equals(project.author.username, Security.connected())) {
			forbidden();
		}
		renderTemplate("Application/editor.html", project);

	}

}