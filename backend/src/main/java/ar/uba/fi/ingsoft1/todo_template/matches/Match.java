package ar.uba.fi.ingsoft1.todo_template.matches;

import ar.uba.fi.ingsoft1.todo_template.reservations.Reservation;
import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private MatchType type;

    @Column(nullable = false)
    private boolean confirmed;

    @ManyToOne(optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "first_team_id")
    private Team firstTeam;

    @ManyToOne(optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "second_team_id")
    private Team secondTeam;

    @OneToOne(mappedBy = "match")
    private Reservation reservation;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "match_pending_confirmations", joinColumns = @JoinColumn(name = "match_id"))
    @Column(name = "email")
    private Set<String> pendingConfirmations = new HashSet<>();

    protected Match() {}

    public Match(String type, Team firstTeam, Team secondTeam, String organizerEmail) {
        this.type = getMatchType(type);
        if (firstTeam != null && secondTeam != null) {
            this.firstTeam = firstTeam;
            this.secondTeam = secondTeam;
        } else {
            this.firstTeam = new Team("team1", organizerEmail, new HashSet<>());
            this.secondTeam = new Team("team2", organizerEmail, new HashSet<>());
        }
    }

    private MatchType getMatchType(String type) {
        return switch (type) {
            case "PUBLIC" -> MatchType.PUBLIC;
            case "PRIVATE" -> MatchType.PRIVATE;
            default -> null;
        };
    }
    public int getFirstTeamMissing() {
        return 5 - firstTeam.getMemberEmails().size();
    }

    public int getSecondTeamMissing() {
        return 5 - secondTeam.getMemberEmails().size();
    }

    public Long getId() { return id; }
    public boolean isConfirmed() { return confirmed; }
    public Team getFirstTeam() { return firstTeam; }
    public Team getSecondTeam() { return secondTeam; }
    public void confirm() { this.confirmed = true; }
    public MatchType getType() { return type; }
    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
    public Set<String> getPendingConfirmations() { return pendingConfirmations; }
    public void setPendingConfirmations(Set<String> pendingConfirmations) { this.pendingConfirmations = pendingConfirmations; }
    public void addPendingConfirmation(String email) { this.pendingConfirmations.add(email); }
    public void removePendingConfirmation(String email) { this.pendingConfirmations.remove(email); }
    public boolean allConfirmed() { return this.pendingConfirmations.isEmpty(); }
    public void setConfirmed(boolean confirmed) { this.confirmed = confirmed; }
}