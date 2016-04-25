package fr.corwin.apps.sheshat.services;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.AlgorithmParameterSpec;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;

import play.Logger;
import play.libs.F.Tuple;
import fr.corwin.apps.sheshat.model.TemporaryKey;
import fr.corwin.apps.sheshat.model.User;

public class SecurityService {

	/**
	 * Generate a key and an iv vector to encrypt / decrypt in AES-CBC-PKCS5
	 * Generated tuple can be used for one time encryptions (for login for
	 * instance)
	 * 
	 * @return a Tuple<String, String> with the first element a generated key
	 *         (256 bits) for AES encryption encoded in Base64 and an iv for
	 *         AES/CBC/PKCS5Padding encoded in Base64
	 */
	public static Tuple<String, String> generateKey() {
		// Get the KeyGenerator
		try {
			KeyGenerator kgen;
			kgen = KeyGenerator.getInstance("AES");
			kgen.init(256);
			// Generate the secret key specs.
			SecretKey skey = kgen.generateKey();
			byte[] raw = skey.getEncoded();
			String key = new Base64().encodeAsString(raw);

			SecureRandom randomSecureRandom = SecureRandom
					.getInstance("SHA1PRNG");
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			byte[] iv = new byte[cipher.getBlockSize()];
			randomSecureRandom.nextBytes(iv);
			String ivStr = new Base64().encodeAsString(iv);
			return new Tuple(key, ivStr);

		} catch (NoSuchAlgorithmException e) {
			Logger.error("Error while generating key: %s",
					"NoSuchAlgorithmException");
		} catch (NoSuchPaddingException e) {
			Logger.error("Error while generating key: %s",
					"NoSuchPaddingException");
		}
		return null;
	}

	public static String resizeKey(String key) {
		String result = key;
		if (key.length() > 31) {
			result = key.substring(0, 31);
		} else if (key.length() < 31) {
			while (result.length() < 31) {
				result = result + "0";
			}
		}
		return Base64.encodeBase64String(result.getBytes());
	}

	/**
	 * Encrypt a message with AES encryption mechanism.
	 * 
	 * @param key
	 *            : key to be used for encryption, provided in Base64 (can be
	 *            get by calling generateKey method)
	 * @param ivBase64
	 *            : initialization vector for encryption, provided in Base64
	 *            (can be get by calling generateKey method)
	 * @param message
	 *            : Message to encrypt
	 * @return String: encrypted message in Base64 (for easy sharing / storing),
	 *         null in case of any issue in the process
	 */
	public static String encrypt(String key, String ivBase64, String message) {
		try {
			SecretKeySpec skeySpec = new SecretKeySpec(
					new Base64().decode(key), "AES");
			AlgorithmParameterSpec iv = new IvParameterSpec(
					Base64.decodeBase64(ivBase64));

			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
			String encrypt = (new Base64()).encodeAsString(cipher
					.doFinal(message.getBytes("UTF-8")));

			return encrypt;
		} catch (NoSuchAlgorithmException ex) {
			Logger.error("Error while encrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (IllegalBlockSizeException ex) {
			Logger.error("Error while encrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (BadPaddingException ex) {
			Logger.error("Error while encrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (InvalidKeyException ex) {
			Logger.error("Error while encrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (NoSuchPaddingException ex) {
			Logger.error("Error while encrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (InvalidAlgorithmParameterException e) {
			Logger.error("Error while encrypting AES value: %s",
					"InvalidAlgorithmParameterException");
		} catch (UnsupportedEncodingException e) {
			Logger.error("Error while encrypting AES value: %s",
					"UnsupportedEncodingException");
		}
		return null;
	}

	/**
	 * Decrypt a message with AES encryption mechanism.
	 * 
	 * @param key
	 *            : key to be used for encryption, provided in Base64 (can be
	 *            get by calling generateKey method)
	 * @param ivBase64
	 *            : initialization vector for encryption, provided in Base64
	 *            (can be get by calling generateKey method)
	 * @param encrypted
	 *            : Message to decrypt, provided in Base64
	 * @return String: decrypted message or null in case of issue in the process
	 */
	public static String decrypt(String key, String ivBase64, String encrypted) {
		try {
			Key k = new SecretKeySpec(new Base64().decode(key), "AES");
			AlgorithmParameterSpec iv = new IvParameterSpec(
					Base64.decodeBase64(ivBase64));

			Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
			c.init(Cipher.DECRYPT_MODE, k, iv);
			byte[] decodedValue = new Base64().decode(encrypted);
			byte[] decValue = c.doFinal(decodedValue);
			String decryptedValue = new String(decValue);
			return decryptedValue;
		} catch (IllegalBlockSizeException ex) {
			Logger.error("Error while decrypting AES value: %s",
					"IllegalBlockSizeException");
		} catch (BadPaddingException ex) {
			Logger.error("Error while decrypting AES value: %s",
					"BadPaddingException");
		} catch (InvalidKeyException ex) {
			Logger.error("Error while decrypting AES value: %s",
					"InvalidKeyException");
		} catch (NoSuchAlgorithmException ex) {
			Logger.error("Error while decrypting AES value: %s",
					"NoSuchAlgorithmException");
		} catch (NoSuchPaddingException ex) {
			Logger.error("Error while decrypting AES value: %s",
					"NoSuchPaddingException");
		} catch (InvalidAlgorithmParameterException e) {
			Logger.error("Error while decrypting AES value: %s",
					"InvalidAlgorithmParameterException");
		}
		return null;
	}

	public static String getChecksumFromFile(File file) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			FileInputStream fis = new FileInputStream(file);
			byte[] dataBytes = new byte[1024];

			int nread = 0;

			while ((nread = fis.read(dataBytes)) != -1) {
				md.update(dataBytes, 0, nread);
			}
			fis.close();

			byte[] mdbytes = md.digest();
			// convert the byte to hex format
			StringBuffer sb = new StringBuffer("");
			for (int i = 0; i < mdbytes.length; i++) {
				sb.append(Integer.toString((mdbytes[i] & 0xff) + 0x100, 16)
						.substring(1));
			}

			return sb.toString();

		} catch (NoSuchAlgorithmException e) {
			Logger.error("Error while trying to compute checksum of file: %s",
					"NoSuchAlgorithmException");
		} catch (FileNotFoundException e) {
			Logger.error("Error while trying to compute checksum of file: %s",
					"FileNotFoundException");
		} catch (IOException e) {
			Logger.error("Error while trying to compute checksum of file: %s",
					"IOException");
		}
		return null;
	}

	public static Boolean connectUser(String userName, String password,
			Long temporaryKey) {
		TemporaryKey key = TemporaryKey.findById(temporaryKey);
		if (key == null) {
			return false;
		}
		String plainPassword = decrypt(key.getKey(), key.getIv(), password);
		if (plainPassword == null) {
			return false;
		}
		if (User.count("byUsernameAndPassword", userName,
				DigestUtils.sha256Hex(plainPassword)) == 1) {
			plainPassword = ""; // Just to clean the pile in case of late
								// garbage
			return true;
		}
		plainPassword = ""; // Just to clean the pile in case of late garbage
		return false;
	}

}
