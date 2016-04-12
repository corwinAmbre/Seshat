package fr.corwin.apps.sheshat.tests.models;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.junit.Before;
import org.junit.Test;

import play.Play;
import play.test.Fixtures;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.PublicVersion;
import fr.corwin.apps.sheshat.model.User;

public class ProjectPublicModelTest extends UnitTest {

	private static final String USERNAME = "test User";
	private static final String PASSWORD = "passwordtest";
	private static final String USERNAME_SHA1 = "412021ba4dbdd19ca3b2fc1eb42353b43c06974567474570d09c0e15a444c4bf";
	private static final String TEST_FILE_PATH = "test/test-files/loreIpsum.txt";
	private static final String TEST_FILE_CHECKSUM = "563934aa9a0c1e8dceb5ad7163a7e0c7f44dce95e42e3b4eab418389333f980d";
	private static final String INVITE_EMAIL = "testmail@inviteseshat.com";

	private static final String PROJECT_NAME = "My project for testing";

	private User user;
	private Project project;

	@Before
	public void before() {
		Fixtures.deleteAllModels();
		File savedFile = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + USERNAME_SHA1 + File.separator
						+ "public" + File.separator + TEST_FILE_CHECKSUM);
		if (savedFile.exists()) {
			assertTrue(savedFile.delete());
		}
		user = new User(USERNAME, PASSWORD).save();
		user.addProject(PROJECT_NAME);
		user.save();
		project = user.getProjects().get(0);
	}

	@Test
	public void testAddPublicVersion() {
		assertEquals(0, PublicVersion.count());
		File publicVersion = new File(TEST_FILE_PATH);
		assertNotNull(project.addPublicVersion(publicVersion));
		user.save();

		assertEquals(1, PublicVersion.count());
		assertTrue(CollectionUtils.isNotEmpty(project.getPublicVersions()));
		assertEquals(1, project.getPublicVersions().size());
		PublicVersion version = project.getPublicVersions().get(0);
		assertNotNull(version.id);
		assertNotNull(version.date);
		assertFalse(version.isLimitedByInvites);
		assertNotNull(version.checksum);
		assertEquals(TEST_FILE_CHECKSUM, version.checksum);
		File savedFile = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + USERNAME_SHA1 + File.separator
						+ "public" + File.separator + TEST_FILE_CHECKSUM);
		assertTrue(savedFile.exists());
		assertTrue(Files.isRegularFile(savedFile.toPath()));
		try {
			List<String> originalContent = Files.readAllLines(
					publicVersion.toPath(), StandardCharsets.UTF_8);
			List<String> savedFileContent = Files.readAllLines(
					savedFile.toPath(), StandardCharsets.UTF_8);
			assertEquals(originalContent.size(), savedFileContent.size());
			for (int i = 0; i < originalContent.size(); ++i) {
				assertEquals(originalContent.get(i), savedFileContent.get(i));
			}
		} catch (IOException e) {
			fail(e.getMessage());
		}
		assertTrue(savedFile.delete());
	}

	@Test
	public void testAddPublicVersionWithInvites() {
		assertEquals(0, PublicVersion.count());
		File publicVersion = new File(TEST_FILE_PATH);
		assertNotNull(project.addPublicVersion(publicVersion)
				.withLimitedInvitationTo(INVITE_EMAIL));
		user.save();
		assertEquals(1, PublicVersion.count());
		PublicVersion version = project.getPublicVersions().get(0);
		assertTrue(version.isLimitedByInvites);
		assertTrue(CollectionUtils.isNotEmpty(version.invites));
		assertEquals(1, version.invites.size());
		assertEquals(INVITE_EMAIL, version.invites.get(0));
		version.withLimitedInvitationTo(INVITE_EMAIL);
		assertEquals(1, version.invites.size());
	}

}
