package fr.corwin.apps.sheshat.model;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import play.db.jpa.Model;

@Entity
public class PublicVersion extends Model {

	@ManyToOne
	public Project project;

	public Date date;
	public Boolean isLimitedByInvites;
	public String checksum;

	public ArrayList<String> invites;

	public PublicVersion(Project project, String checksum) {
		this.project = project;
		this.checksum = checksum;
		this.date = Calendar.getInstance().getTime();
		this.isLimitedByInvites = false;
		this.invites = new ArrayList<String>();
	}

	public PublicVersion withLimitedInvitationTo(String email) {
		this.isLimitedByInvites = true;
		if (!this.invites.contains(email)) {
			this.invites.add(email);
		}
		return this;
	}

	public PublicVersion notLimitedByInvites() {
		this.isLimitedByInvites = false;
		return this;
	}

}
