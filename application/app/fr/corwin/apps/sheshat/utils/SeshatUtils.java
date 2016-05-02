package fr.corwin.apps.sheshat.utils;

import java.io.File;

import org.apache.commons.codec.digest.DigestUtils;

import play.Play;
import fr.corwin.apps.sheshat.model.User;

public class SeshatUtils {

	public static String getStoragePath(User author) {
		return Play.configuration.getProperty("seshat.paths.versions")
				+ File.separator + DigestUtils.sha256Hex(author.username)
				+ File.separator;

	}

}
