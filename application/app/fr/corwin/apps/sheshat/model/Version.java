package fr.corwin.apps.sheshat.model;

import java.util.Calendar;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import play.db.jpa.Model;

@Entity
public class Version extends Model {

	public Date date;
	public Integer words;
	public Integer chapters;

	@ManyToOne
	public Project project;

	public String checksum;

	public Version(Project project, String checksum) {
		this.date = Calendar.getInstance().getTime();
		this.project = project;
		this.checksum = checksum;
	}

	public Version withWords(int words) {
		this.words = words;
		return this;
	}

	public Version withChapters(int chapters) {
		this.chapters = chapters;
		return this;
	}

}
