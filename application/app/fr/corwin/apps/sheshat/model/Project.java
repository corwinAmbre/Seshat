package fr.corwin.apps.sheshat.model;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import play.Play;
import play.db.jpa.Model;
import play.libs.Files;
import fr.corwin.apps.sheshat.services.SecurityService;

@Entity
public class Project extends Model {

	public String name;

	@ManyToOne
	public User author;

	@Lob
	public String summary;

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
	List<Version> versions;

	public Project(String name, User author) {
		this.name = name;
		this.author = author;
		this.versions = new ArrayList<Version>();
	}

	public void addVersion(File version) {
		String checksum = SecurityService.getChecksumFromFile(version);
		File dest = new File(
				Play.configuration.getProperty("seshat.paths.versions")
						+ File.separator + checksum);
		Files.copy(version, dest);
		Version v = new Version(this, checksum);
		this.versions.add(v);
	}

	public List<Version> getVersions() {
		return versions;
	}

}
