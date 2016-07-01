package fr.corwin.apps.sheshat.model;

import java.io.File;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.OneToMany;

import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;

import play.db.jpa.Model;
import play.libs.F.Tuple;
import fr.corwin.apps.sheshat.services.SecurityService;
import fr.corwin.apps.sheshat.utils.SeshatUtils;

@Entity
public class User extends Model {

	public String username;
	public String password;
	private Integer failedLogin;
	private Boolean blockedUser;
	private Boolean isAdmin;
	private Long quota;

	@OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
	List<Project> projects;

	@Lob
	private String keysVault;
	private String ivVault;

	public User(String username, String password) {
		this.username = username;
		this.password = DigestUtils.sha256Hex(password);
		this.projects = new ArrayList<Project>();
		Tuple<String, String> iv = SecurityService.generateKey();
		this.keysVault = SecurityService.encrypt(
				SecurityService.resizeKey(password), iv._2, "");
		this.ivVault = iv._2;
		this.isAdmin = false;
		this.quota = SeshatUtils.getDefaultQuota();
		this.failedLogin = 0;
		this.blockedUser = false;
	}

	public User isAdmin(Boolean isAdmin) {
		this.isAdmin = isAdmin;
		return this;
	}

	public Project addProject(String name, String key) {
		Project p = new Project(name, this, key);
		this.projects.add(p);
		return p;
	}

	public List<Project> getProjects() {
		return projects;
	}

	public Tuple<Boolean, String> updatePassword(String oldPassword,
			String newPassword, String confirmNewPassword) {
		if (!StringUtils.equals(newPassword, confirmNewPassword)) {
			return new Tuple<Boolean, String>(false,
					"user.changepassword.validation.notsamepasswords");
		}
		if (!StringUtils.equals(this.password,
				DigestUtils.sha256Hex(oldPassword))) {
			return new Tuple<Boolean, String>(false,
					"user.changepassword.validation.invalidcurrentpassword");
		}
		String vault = SecurityService.decrypt(
				SecurityService.resizeKey(oldPassword), this.ivVault,
				this.keysVault);
		if (vault == null) {
			return new Tuple<Boolean, String>(false, "error.generic.unexpected");
		}
		this.keysVault = SecurityService.encrypt(
				SecurityService.resizeKey(newPassword), this.ivVault,
				new String(vault));
		this.password = DigestUtils.sha256Hex(newPassword);
		this.save();
		return new Tuple<Boolean, String>(true, null);
	}

	public Tuple<String, String> getVault() {
		return new Tuple<String, String>(this.keysVault, this.ivVault);
	}

	public void setVault(String vault) {
		this.keysVault = vault;
	}

	public BigInteger getSpaceConsumed() {
		String path = SeshatUtils.getStoragePath(this);
		File folder = new File(path);
		if (folder.exists()) {
			return FileUtils.sizeOfAsBigInteger(folder);
		}
		return BigInteger.ZERO;
	}

	public static User findByUsername(String username) {
		return User.find("byUsername", username).first();
	}

	public static User connect(String username, String password) {
		User user = User.find("byUsername", username).first();
		if (user == null) {
			return null;
		} else {
			if (!user.blockedUser
					&& StringUtils.equals(user.password,
							DigestUtils.sha256Hex(password))) {
				user.failedLogin = 0;
				user.save();
				return user;
			} else {
				user.failedLogin += 1;
				if (user.failedLogin >= SeshatUtils.getLimitFailedLogins()) {
					user.blockedUser = true;
				}
				user.save();
				return null;
			}
		}
	}

	public static Tuple<User, String> createUser(String username,
			String password, String repeatPassword) {
		if (!StringUtils.equals(password, repeatPassword)) {
			return new Tuple<User, String>(null,
					"user.create.error.repeatpassword");
		}
		if (findByUsername(username) != null) {
			return new Tuple<User, String>(null,
					"user.create.error.usernameexists");
		}
		User user = new User(username, password);
		user.save();
		return new Tuple<User, String>(user, "");
	}

	public Boolean isAdmin() {
		return isAdmin;
	}

	public Long getQuota() {
		return quota;
	}

	public Integer getFailedLogin() {
		return failedLogin;
	}

	public Boolean isBlockedUser() {
		return blockedUser;
	}

	public void lockUser() {
		this.blockedUser = true;
		this.save();
	}

	public void unlockUser() {
		this.blockedUser = false;
		this.failedLogin = 0;
		this.save();
	}

}
