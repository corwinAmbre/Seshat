package fr.corwin.apps.sheshat.model;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import play.db.jpa.Model;
import play.libs.Files;
import fr.corwin.apps.sheshat.services.SecurityService;
import fr.corwin.apps.sheshat.utils.SeshatUtils;

@Entity
public class Project extends Model {

	public String name;

	@ManyToOne
	public User author;

	@Lob
	public String summary;

	public String idKey;

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
	List<Version> versions;

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
	List<PublicVersion> publicVersions;

	public Project(String name, User author, String key) {
		this.name = name;
		this.author = author;
		this.idKey = key;
		this.versions = new ArrayList<Version>();
		this.publicVersions = new ArrayList<PublicVersion>();
	}

	public void addVersion(File version) {
		String checksum = SecurityService.getChecksumFromFile(version);
		File dest = new File(SeshatUtils.getStoragePath(author) + checksum);
		Files.copy(version, dest);
		Version v = new Version(this, checksum);
		this.versions.add(v);
	}

	public PublicVersion addPublicVersion(File publicVersion) {
		String checksum = SecurityService.getChecksumFromFile(publicVersion);
		File dest = new File(SeshatUtils.getStoragePath(author) + "public"
				+ File.separator + checksum);
		Files.copy(publicVersion, dest);
		PublicVersion v = new PublicVersion(this, checksum);
		this.publicVersions.add(v);
		return v;
	}

	public List<Version> getVersions() {
		return versions;
	}

	public List<PublicVersion> getPublicVersions() {
		return publicVersions;
	}

}
