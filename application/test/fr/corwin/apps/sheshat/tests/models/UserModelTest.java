package fr.corwin.apps.sheshat.tests.models;

import java.io.File;
import java.math.BigInteger;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.StringUtils;
import org.junit.Before;
import org.junit.Test;

import play.Logger;
import play.Play;
import play.libs.F.Tuple;
import play.libs.Files;
import play.test.Fixtures;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.services.SecurityService;

public class UserModelTest extends UnitTest {

	private static final String USERNAME = "test User";
	private static final String PASSWORD = "passwordtest";
	private static final String USERNAME_SHA1 = "412021ba4dbdd19ca3b2fc1eb42353b43c06974567474570d09c0e15a444c4bf";

	private static final String TEST_FILE_PATH = "test/test-files/testChecksumFile.txt";
	private static final String PROJECT_NAME = "My project for testing";
	private static final String PROJECT_KEY = "6KeWgxIT6/TDV5MPZQCm7lodTLYH9T2cHDh8x7dL/QA=";

	@Before
	public void before() {
		Fixtures.deleteAllModels();
		File savedFile = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + USERNAME_SHA1);
		if (savedFile.exists()) {
			assertTrue(Files.deleteDirectory(savedFile));
		}
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
		assertNotNull(user.getQuota());
		assertEquals(new Integer(0), user.getFailedLogin());
		assertFalse(user.isBlockedUser());
		assertFalse(user.isAdmin());
	}

	@Test
	public void testUserVault() {
		assertEquals(0, User.count());
		User user = new User(USERNAME, PASSWORD).save();
		assertEquals(1, User.count());
		Tuple<String, String> vault = user.getVault();
		assertNotNull(vault);
		assertTrue(StringUtils.isNotEmpty(vault._1));
		Logger.info(vault._1);
		assertEquals(SecurityService.encrypt(
				SecurityService.resizeKey(PASSWORD), vault._2, ""), vault._1);
		assertEquals("", SecurityService.decrypt(
				SecurityService.resizeKey(PASSWORD), vault._2, vault._1));
	}

	@Test
	public void testFolderSize() {
		User user = new User(USERNAME, PASSWORD).save();
		assertEquals(BigInteger.ZERO, user.getSpaceConsumed());
		File loreIpsum = new File(TEST_FILE_PATH);
		Project p = user.addProject(PROJECT_NAME, PROJECT_KEY);
		p.addVersion(loreIpsum);
		assertTrue(BigInteger.ZERO.compareTo(user.getSpaceConsumed()) < 0);
	}

	@Test
	public void testGetUserByUsername() {
		assertNull(User.findByUsername(USERNAME));
		User dbUser = new User(USERNAME, PASSWORD).save();
		assertNull(User.findByUsername(PROJECT_NAME));
		User user = User.findByUsername(USERNAME);
		assertNotNull(user);
		assertEquals(dbUser.id, user.id);
	}

	@Test
	public void testConnect() {
		new User(USERNAME, PASSWORD).save();
		assertNull(User.connect(PROJECT_NAME, PROJECT_NAME));
		assertNull(User.connect(USERNAME, PROJECT_NAME));
		assertEquals(new Integer(1), User.findByUsername(USERNAME)
				.getFailedLogin());
		assertFalse(User.findByUsername(USERNAME).isBlockedUser());

		User user = User.connect(USERNAME, PASSWORD);
		assertNotNull(user);
		assertEquals(new Integer(0), user.getFailedLogin());
		assertFalse(user.isBlockedUser());

		assertNull(User.connect(USERNAME, PROJECT_NAME));
		assertNull(User.connect(USERNAME, PROJECT_NAME));
		assertNull(User.connect(USERNAME, PROJECT_NAME));
		assertEquals(new Integer(3), User.findByUsername(USERNAME)
				.getFailedLogin());
		assertTrue(User.findByUsername(USERNAME).isBlockedUser());
		assertNull(User.connect(USERNAME, PASSWORD));
	}

}
