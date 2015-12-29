package fr.corwin.apps.sheshat.model;

import java.util.Calendar;
import java.util.Date;

import javax.persistence.Entity;

import play.db.jpa.Model;
import play.libs.F.Tuple;
import fr.corwin.apps.sheshat.services.SecurityService;

@Entity
public class TemporaryKey extends Model {

	private String key;
	private String iv;
	private Date creationDate;

	private TemporaryKey() {
		Tuple<String, String> tuple = SecurityService.generateKey();
		this.key = tuple._1;
		this.iv = tuple._2;
		this.creationDate = Calendar.getInstance().getTime();
	}

	public static TemporaryKey getTemporaryKey() {
		return new TemporaryKey().save();
	}

	public String getKey() {
		return key;
	}

	public String getIv() {
		return iv;
	}

	public Date getCreationDate() {
		return creationDate;
	};

}
