package fr.corwin.apps.sheshat.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.OneToMany;

import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.codec.digest.DigestUtils;

import play.db.jpa.Model;
import play.libs.F.Tuple;
import fr.corwin.apps.sheshat.services.SecurityService;

@Entity
public class User extends Model {

	public String username;
	public String password;

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
				SecurityService.resizeKey(password), iv._2, "{}");
		this.ivVault = iv._2;
	}

	public Project addProject(String name, String key) {
		Project p = new Project(name, this, key);
		this.projects.add(p);
		return p;
	}

	public List<Project> getProjects() {
		return projects;
	}

	public Boolean updatePassword(String oldPassword, String newPassword) {
		if (!StringUtils.equals(this.password,
				DigestUtils.sha256Hex(oldPassword))) {
			return false;
		}
		String vault = SecurityService.decrypt(
				SecurityService.resizeKey(oldPassword), this.ivVault,
				this.keysVault);
		if (vault == null) {
			return false;
		}
		this.keysVault = SecurityService.encrypt(
				SecurityService.resizeKey(newPassword), this.ivVault,
				new String(vault));
		this.password = DigestUtils.sha256Hex(newPassword);
		this.save();
		return true;
	}

	public Tuple<String, String> getVault() {
		return new Tuple<String, String>(this.keysVault, this.ivVault);
	}

}
