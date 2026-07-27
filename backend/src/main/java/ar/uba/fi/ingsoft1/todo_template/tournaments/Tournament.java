package ar.uba.fi.ingsoft1.todo_template.tournaments;

import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Tournament {
    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "Tournament name is required")
    private String name;

    @Column(nullable = false)
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @Column(nullable = false)
    @NotNull(message = "Tournament format is required")
    @Enumerated(EnumType.STRING)
    private TournamentFormat format;

    @Column(nullable = false)
    @NotNull(message = "Maximum number of teams is required")
    @Min(value = 2, message = "At least 2 teams are required")
    private Integer maxTeams;

    @Column(nullable = false)
    @NotBlank(message = "Organizer email is required")
    private String organizerEmail;

    @Column(nullable = false)
    @NotNull(message = "Tournament status is required")
    @Enumerated(EnumType.STRING)
    private TournamentStatus status;

    @ManyToMany
    @JoinTable(
            name = "tournament_teams",
            joinColumns = @JoinColumn(name = "tournament_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    private Set<Team> teams = new HashSet<>();

    private LocalDate endDate;

    @Column(length = 2000)
    private String description;

    private String prizes;

    private Double registrationCost;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Tournament() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = TournamentStatus.OPEN_FOR_REGISTRATION;
    }

    public Tournament(String name, LocalDate startDate, TournamentFormat format,
                      Integer maxTeams, String organizerEmail) {
        this();
        this.name = name;
        this.startDate = startDate;
        this.format = format;
        this.maxTeams = maxTeams;
        this.organizerEmail = organizerEmail;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
        this.updatedAt = LocalDateTime.now();
    }

    public TournamentFormat getFormat() {
        return format;
    }

    public void setFormat(TournamentFormat format) {
        this.format = format;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getMaxTeams() {
        return maxTeams;
    }

    public void setMaxTeams(Integer maxTeams) {
        this.maxTeams = maxTeams;
        this.updatedAt = LocalDateTime.now();
    }

    public String getOrganizerEmail() {
        return organizerEmail;
    }

    public void setOrganizerEmail(String organizerEmail) {
        this.organizerEmail = organizerEmail;
    }

    public TournamentStatus getStatus() {
        return status;
    }

    public void setStatus(TournamentStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Set<Team> getTeams() {
        return teams;
    }

    public void setTeams(Set<Team> teams) {
        this.teams = teams;
    }

    public void addTeam(Team team) {
        this.teams.add(team);
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPrizes() {
        return prizes;
    }

    public void setPrizes(String prizes) {
        this.prizes = prizes;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getRegistrationCost() {
        return registrationCost;
    }

    public void setRegistrationCost(Double registrationCost) {
        this.registrationCost = registrationCost;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public boolean canBeEdited() {
        return status == TournamentStatus.OPEN_FOR_REGISTRATION;
    }
}