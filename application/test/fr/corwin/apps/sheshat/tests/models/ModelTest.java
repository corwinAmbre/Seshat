package fr.corwin.apps.sheshat.tests.models;

import java.io.File;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.CollectionUtils;
import org.junit.Before;
import org.junit.Test;

import play.test.Fixtures;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.model.Version;

public class ModelTest extends UnitTest {

	@Before
	public void before() {
		Fixtures.deleteAllModels();
	}

	@Test
	public void testUser() {
		assertEquals(0, User.count());
		String username = "test User";
		String password = "passwordtest";
		User user = new User(username, password).save();
		assertEquals(1, User.count());
		assertNotNull(user);
		assertNotNull(user.id);
		assertEquals(username, user.username);
		assertEquals(DigestUtils.sha256Hex(password), user.password);
	}

	@Test
	public void testProject() {
		assertEquals(0, Project.count());
		String username = "test User";
		String password = "passwordtest";
		String projectName = "myProject";

		User user = new User(username, password).save();
		user.addProject(projectName);
		user.save();

		assertEquals(1, Project.count());
		assertTrue(CollectionUtils.isNotEmpty(user.getProjects()));
		assertEquals(1, user.getProjects().size());
		Project p = user.getProjects().get(0);
		assertEquals(projectName, p.name);
		assertNotNull(p.author);
		assertEquals(user.id, p.author.id);
	}

	@Test
	public void testVersion() {
		assertEquals(0, Version.count());
		String username = "test User";
		String password = "passwordtest";
		String projectName = "myProject";
		File loreIpsum = new File("test/test-files/testChecksumFile.txt");

		User user = new User(username, password).save();
		Project p = user.addProject(projectName);
		p.addVersion(loreIpsum);
		user.save();

		assertEquals(1, Version.count());
		assertTrue(CollectionUtils.isNotEmpty(p.getVersions()));
		assertEquals(1, p.getVersions().size());
		Version v = p.getVersions().get(0);
		assertNotNull(v.date);
		assertEquals(
				"563934aa9a0c1e8dceb5ad7163a7e0c7f44dce95e42e3b4eab418389333f980d",
				v.checksum);
	}
}
