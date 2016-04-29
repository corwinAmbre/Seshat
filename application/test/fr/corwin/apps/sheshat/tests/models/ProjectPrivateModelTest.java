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
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.model.Version;

public class ProjectPrivateModelTest extends UnitTest {

	private static final String USERNAME = "test User";
	private static final String PASSWORD = "passwordtest";
	private static final String USERNAME_SHA1 = "412021ba4dbdd19ca3b2fc1eb42353b43c06974567474570d09c0e15a444c4bf";
	private static final String TEST_FILE_PATH = "test/test-files/testChecksumFile.txt";
	private static final String TEST_FILE_CHECKSUM = "030dfbf355f658bc9a816ffe66a3d89dd064f8696def894be7afe60d9842e0ab";

	private static final String PROJECT_NAME = "My project for testing";
	private static final String PROJECT_KEY = "6KeWgxIT6/TDV5MPZQCm7lodTLYH9T2cHDh8x7dL/QA=";

	private User user;

	@Before
	public void before() {
		Fixtures.deleteAllModels();
		File savedFile = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + USERNAME_SHA1 + File.separator
						+ TEST_FILE_CHECKSUM);
		if (savedFile.exists()) {
			assertTrue(savedFile.delete());
		}
		user = new User(USERNAME, PASSWORD).save();
	}

	@Test
	public void testProject() {
		assertEquals(0, Project.count());

		user.addProject(PROJECT_NAME, PROJECT_KEY);
		user.save();

		assertEquals(1, Project.count());
		assertTrue(CollectionUtils.isNotEmpty(user.getProjects()));
		assertEquals(1, user.getProjects().size());
		Project p = user.getProjects().get(0);
		assertEquals(PROJECT_NAME, p.name);
		assertEquals(PROJECT_KEY, p.idKey);
		assertNotNull(p.author);
		assertEquals(user.id, p.author.id);
	}

	@Test
	public void testVersion() {
		assertEquals(0, Version.count());
		File loreIpsum = new File(TEST_FILE_PATH);

		Project p = user.addProject(PROJECT_NAME, PROJECT_KEY);
		p.addVersion(loreIpsum);
		user.save();

		assertEquals(1, Version.count());
		assertTrue(CollectionUtils.isNotEmpty(p.getVersions()));
		assertEquals(1, p.getVersions().size());
		Version v = p.getVersions().get(0);
		assertNotNull(v.date);
		assertEquals(TEST_FILE_CHECKSUM, v.checksum);
		File savedFile = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + USERNAME_SHA1 + File.separator
						+ TEST_FILE_CHECKSUM);
		assertTrue(savedFile.exists());
		assertTrue(Files.isRegularFile(savedFile.toPath()));
		try {
			List<String> originalContent = Files.readAllLines(
					loreIpsum.toPath(), StandardCharsets.UTF_8);
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

}
