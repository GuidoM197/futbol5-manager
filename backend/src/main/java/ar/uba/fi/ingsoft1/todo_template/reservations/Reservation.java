package ar.uba.fi.ingsoft1.todo_template.reservations;

import ar.uba.fi.ingsoft1.todo_template.fields.SoccerField;
import ar.uba.fi.ingsoft1.todo_template.matches.Match;
import ar.uba.fi.ingsoft1.todo_template.matches.MatchType;
import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;

@Entity
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @ManyToOne(optional = false)
    @JoinColumn(name = "field_id", referencedColumnName = "id")
    private SoccerField field;

    @Column(nullable = false)
    private LocalDate day;

    @Column(nullable = false)
    private int startHour;

    @Column(nullable = false)
    private int endHour;

    @OneToOne(optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "match_id", referencedColumnName = "id")
    private Match match;

    public Reservation() {}

    public Reservation(String userEmail, SoccerField field, LocalDate day, int startHour, int endHour,
                       String type, Team team1, Team team2) {
        this.userEmail = userEmail;
        this.field = field;
        this.day = day;
        this.startHour = startHour;
        this.endHour = endHour;
        this.match = new Match(type, team1, team2, userEmail);
    }

    public Long getId() { return id; }
    public SoccerField getField() { return field; }
    public LocalDate getDay() { return day; }
    public int getStartHour() { return startHour; }
    public int getEndHour() { return endHour; }
    public void setField(SoccerField field) { this.field = field; }
    public void setDay(LocalDate day) { this.day = day; }
    public void setStartHour(int startHour) { this.startHour = startHour; }
    public void setEndHour(int endHour) { this.endHour = endHour; }
}