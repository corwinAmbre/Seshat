package fr.corwin.apps.sheshat.services;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
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

import play.Logger;
import play.libs.F.Tuple;

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

}
