package fr.corwin.apps.sheshat.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.OneToMany;

import org.apache.commons.codec.digest.DigestUtils;

import play.db.jpa.Model;

@Entity
public class User extends Model {

	public String username;
	public String password;

	@OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
	List<Project> projects;

	public User(String username, String password) {
		this.username = username;
		this.password = DigestUtils.sha256Hex(password);
		this.projects = new ArrayList<Project>();
	}

	public Project addProject(String name) {
		Project p = new Project(name, this);
		this.projects.add(p);
		return p;
	}

	public List<Project> getProjects() {
		return projects;
	}

}
