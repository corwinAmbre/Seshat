package fr.corwin.apps.sheshat.tests.controllers;

import org.junit.Before;
import org.junit.Test;

import play.mvc.Http.Response;
import play.test.Fixtures;
import play.test.FunctionalTest;
import fr.corwin.apps.sheshat.model.User;

public class ApplicationTest extends FunctionalTest {

	@Before
	public void before() {
		Fixtures.deleteAllModels();
	}

	@Test
	public void testNotConnectedUser() {
		Response response = GET("/");
		assertStatus(302, response);
		assertHeaderEquals("Location", "/login", response);
	}

	@Test
	public void testConnectionUser() {
		new User("fctTestUser", "password").save();
		Response response = POST("/?username=fctTestUser&password=password");
		assertStatus(200, response);
	}
}