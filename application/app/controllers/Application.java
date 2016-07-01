package controllers;

import org.apache.commons.lang.StringUtils;

import play.Logger;
import play.i18n.Messages;
import play.libs.F.Tuple;
import play.mvc.Before;
import play.mvc.Controller;
import play.mvc.With;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.services.SecurityService;

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

	public static void createProject(String name, String key, String vault,
			String firstVersion) {
		if (StringUtils.isEmpty(firstVersion)) {
			Logger.error("Empty version");
			error();
		}
		User user = User.findByUsername(Security.connected());
		Project project = user.addProject(name, key);
		project.addVersion(firstVersion);
		user.setVault(vault);
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

	public static void addVersion(Long id, String version) {
		Project project = Project.findById(id);
		if (project == null) {
			notFound();
		}
		if (!StringUtils.equals(project.author.username, Security.connected())) {
			forbidden();
		}
		if (StringUtils.isEmpty(version)) {
			Logger.error("Empty version");
			error();
		}
		User user = (User) renderArgs.get("user");
		if (user.getQuota() > 0
				&& user.getSpaceConsumed().longValue() > user.getQuota()) {
			error(509, Messages.get("error.user.quota.exceeded"));
		}
		project.addVersion(version);
		project.save();
		renderText(user.getSpaceConsumed().toString());
	}

	public static void changePassword(String currentpwd, String newpwd,
			String newpwd2) {
		User user = User.findByUsername(Security.connected());
		Tuple<Boolean, String> result = user.updatePassword(currentpwd, newpwd,
				newpwd2);
		if (result._1) {
			String vault = SecurityService.decrypt(
					SecurityService.resizeKey(newpwd), user.getVault()._2,
					user.getVault()._1);
			response.setCookie("vault", vault.replaceAll("\"", "'"));
			response.setCookie("masterKey", user.password);
			renderText("Ok");
		} else {
			error(500, Messages.get(result._2));
		}
	}

}