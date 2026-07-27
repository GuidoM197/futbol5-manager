package ar.uba.fi.ingsoft1.todo_template.teams;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Schema(description = "Team entity representing a soccer team")
public class Team {
    @Id
    @GeneratedValue
    @Schema(description = "Unique identifier of the team", example = "123")
    private Long id;

    @Column(nullable = false)
    @Schema(description = "Name of the team", example = "The Champions")
    private String teamName;

    @Column(nullable = false)
    @Schema(description = "Email of the team captain/leader", example = "captain@example.com")
    private String leader;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "team_members", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "email", nullable = false)
    @Schema(description = "Set of email addresses of team members", example = "[\"player1@example.com\", \"player2@example.com\"]")
    private Set<String> memberEmails;

    public Team() {}

    public Team(String teamName, String leader, HashSet<String> memberEmails) {
        this.teamName = teamName;
        this.leader = leader;
        if (memberEmails != null) {
            this.memberEmails = new HashSet<>(memberEmails);
        } else {
            this.memberEmails = memberEmails;
        }
    }

    public Long getId() {
        return id;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getLeader() {
        return leader;
    }

    public Set<String> getMemberEmails() {
        return memberEmails;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setLeader(String leader) {
        this.leader = leader;
    }

    public void setMemberEmails(HashSet<String> memberEmails) {
        this.memberEmails = memberEmails;
    }

    public void addPlayer(String email) {
        memberEmails.add(email);
    }

    public void removePlayer(String email) {
        memberEmails.remove(email);
    }
}
