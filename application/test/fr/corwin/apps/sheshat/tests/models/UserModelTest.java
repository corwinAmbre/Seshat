package fr.corwin.apps.sheshat.tests.models;

import org.apache.commons.codec.digest.DigestUtils;
import org.junit.Before;
import org.junit.Test;

import play.test.Fixtures;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.model.User;

public class UserModelTest extends UnitTest {

	private static final String USERNAME = "test User";
	private static final String PASSWORD = "passwordtest";

	@Before
	public void before() {
		Fixtures.deleteAllModels();
	}

	@Test
	public void testUser() {
		assertEquals(0, User.count());
		User user = new User(USERNAME, PASSWORD).save();
		assertEquals(1, User.count());
		assertNotNull(user);
		assertNotNull(user.id);
		assertEquals(USERNAME, user.username);
		assertNotEquals(PASSWORD, user.password);
		assertEquals(DigestUtils.sha256Hex(PASSWORD), user.password);
	}

}
