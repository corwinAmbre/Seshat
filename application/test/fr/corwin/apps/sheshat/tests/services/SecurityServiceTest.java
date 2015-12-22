package fr.corwin.apps.sheshat.tests.services;

import org.junit.Test;

import play.libs.F.Tuple;
import play.test.UnitTest;
import fr.corwin.apps.sheshat.services.SecurityService;

public class SecurityServiceTest extends UnitTest {

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
}
