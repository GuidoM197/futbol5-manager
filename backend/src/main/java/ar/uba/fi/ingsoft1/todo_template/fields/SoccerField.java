package ar.uba.fi.ingsoft1.todo_template.fields;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

@Entity
public class SoccerField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String administratorEmail;

    @Column(nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String grassType;

    @Column(nullable = false)
    private Integer startTime;

    @Column(nullable = false)
    private Integer endTime;

    public SoccerField() {}

    public SoccerField(String name, String location, String grassType, String administratorEmail,
                       String ownerEmail, Integer startTime, Integer endTime) {
        this.name = name;
        this.location = location;
        this.grassType = grassType;
        this.administratorEmail = administratorEmail;
        this.ownerEmail = ownerEmail;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getGrassType() { return grassType; }

    public String getAdministratorEmail() {return administratorEmail;}

    public Integer getStartTime() {return startTime;}

    public Integer getEndTime() {return endTime;}

    public String getOwnerEmail() {return ownerEmail;}

    public void setOwnerEmail(String ownerEmail) {this.ownerEmail = ownerEmail;}

    public void setName(@NotBlank String name) {
        this.name = name;
    }
    public void setLocation(@NotBlank String location) {
        this.location = location;
    }
    public void setGrassType(@NotBlank String grassType) {
        this.grassType = grassType;
    }
    public void setAdministratorEmail(@NotBlank String administratorEmail) {
        this.administratorEmail = administratorEmail;
    }
    public void setStartTime(@NotBlank Integer startTime) {
        this.startTime = startTime;
    }
    public void setEndTime(@NotBlank Integer endTime) {
        this.endTime = endTime;
    }

}

