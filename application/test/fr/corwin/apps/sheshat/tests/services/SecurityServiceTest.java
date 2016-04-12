package fr.corwin.apps.sheshat.tests.services;

import java.io.File;

import org.junit.Before;
import org.junit.Test;

import play.libs.F.Tuple;
import play.test.Fixtures;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.model.TemporaryKey;
import fr.corwin.apps.sheshat.model.User;
import fr.corwin.apps.sheshat.services.SecurityService;

public class SecurityServiceTest extends UnitTest {

	@Before
	public void before() {
		Fixtures.deleteAllModels();
	}

	@Test
	public void testEncryption() {
		Tuple<String, String> key = SecurityService.generateKey();
		String encrypt = SecurityService.encrypt(key._1, key._2, "Message");
		assertNotNull(encrypt);
	}

	@Test
	public void testLocalDecryptAES() {
		String key = "6KeWgxIT6/TDV5MPZQCm7lodTLYH9T2cHDh8x7dL/QA=";
		String iv = "767oue2NJ9uLqOvjffH1ng==";
		// Encrypted string done by Javascript method, test to ensure
		// compatibility
		String encrypted = "cAgnrSrVUdZOpKJguykRlA==";
		String decrypt = SecurityService.decrypt(key, iv, encrypted);
		assertNotNull(decrypt);
		assertEquals("Message", decrypt);
	}

	@Test
	public void testGetChecksumFromFile() {
		File loreIpsum = new File("test/test-files/testChecksumFile.txt");
		assertTrue(loreIpsum.exists());
		String checksum = SecurityService.getChecksumFromFile(loreIpsum);
		assertNotNull(checksum);
		assertEquals(
				"563934aa9a0c1e8dceb5ad7163a7e0c7f44dce95e42e3b4eab418389333f980d",
				checksum);
	}

	@Test
	public void testUserLogin() {
		String username = "test User";
		String password = "passwordtest";
		new User(username, password).save();
		TemporaryKey key = TemporaryKey.getTemporaryKey();
		TemporaryKey key2 = TemporaryKey.getTemporaryKey();
		String encryptedPassword = SecurityService.encrypt(key.getKey(),
				key.getIv(), password);
		String somethingElse = SecurityService.encrypt(key.getKey(),
				key.getIv(), "somethingelse");

		assertTrue(SecurityService.connectUser(username, encryptedPassword,
				key.getId())); // Nominal case
		assertFalse(SecurityService.connectUser(username, encryptedPassword,
				key.getId() + 1000)); // Temporary key not found
		assertFalse(SecurityService.connectUser(username, encryptedPassword,
				key2.getId())); // Wrong key
		assertFalse(SecurityService.connectUser(username, somethingElse,
				key.getId())); // Wrong password
	}

	@Test
	public void testTemporaryKey() {
		assertEquals(0, TemporaryKey.count());
		TemporaryKey key1 = TemporaryKey.getTemporaryKey();
		TemporaryKey key2 = TemporaryKey.getTemporaryKey();
		assertEquals(2, TemporaryKey.count());
		assertNotNull(key1.getId());
		assertNotNull(key1.getKey());
		assertNotNull(key1.getIv());
		assertNotNull(key1.getCreationDate());
		assertNotNull(key2.getId());
		assertNotNull(key2.getKey());
		assertNotNull(key2.getIv());
		assertNotNull(key2.getCreationDate());
		assertNotEquals(key1.getId(), key2.getId());
		assertNotEquals(key1.getKey(), key2.getKey());
		assertNotEquals(key1.getIv(), key2.getIv());
		assertNotEquals(key1.getCreationDate(), key2.getCreationDate());
	}
}
