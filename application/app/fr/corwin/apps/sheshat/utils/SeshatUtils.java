package fr.corwin.apps.sheshat.utils;

import java.io.File;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;

import play.Play;
import fr.corwin.apps.sheshat.model.User;

public class SeshatUtils {

	public static Long getDefaultQuota() {
		return FileUtils.ONE_MB
				* Integer.parseInt(Play.configuration.getProperty(
						"seshat.users.quota", "0"));
	}

	public static Integer getLimitFailedLogins() {
		return Integer.parseInt(Play.configuration.getProperty(
				"seshat.users.limitfailedlogin", "3"));
	}

	public static String getStoragePath(User author) {
		return Play.configuration.getProperty("seshat.paths.versions")
				+ File.separator + DigestUtils.sha256Hex(author.username)
				+ File.separator;

	}

}
