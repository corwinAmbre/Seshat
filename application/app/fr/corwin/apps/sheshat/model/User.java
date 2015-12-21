package fr.corwin.apps.sheshat.model;

import java.util.Collection;

import javax.persistence.Entity;
import javax.persistence.OneToMany;

import play.db.jpa.Model;

@Entity
public class User extends Model {

	public String username;
	public String password;

	@OneToMany(mappedBy = "author")
	Collection<Project> projects;

	public User(String username, String password) {
		this.username = username;
		this.password = password;
	}
}
