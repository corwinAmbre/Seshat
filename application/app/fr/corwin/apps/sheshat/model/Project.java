package fr.corwin.apps.sheshat.model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import play.db.jpa.Model;

@Entity
public class Project extends Model {

	public String name;

	@ManyToOne
	public User author;

}
