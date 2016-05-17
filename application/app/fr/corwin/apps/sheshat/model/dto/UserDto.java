package fr.corwin.apps.sheshat.model.dto;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

import play.libs.F.Tuple;
import fr.corwin.apps.sheshat.model.Project;
import fr.corwin.apps.sheshat.model.User;

public class UserDto {

	public Long id;
	public String username;
	public Boolean isAdmin;
	public Long quota;
	public BigInteger consumed;
	public List<Tuple<Long, String>> projects;
	public String available;

	public UserDto(User user) {
		this.id = user.id;
		this.username = user.username;
		this.isAdmin = user.getIsAdmin();
		this.quota = user.getQuota();
		this.consumed = user.getSpaceConsumed();
		this.projects = new ArrayList<Tuple<Long, String>>();
		for (Project p : user.getProjects()) {
			this.projects.add(new Tuple<Long, String>(p.id, p.name));
		}
		if (quota == 0) {
			available = "Unlimited";
		}
		BigInteger tmp = new BigInteger(quota.toString());
		tmp.subtract(consumed);
		available = tmp.toString();
	}

}
