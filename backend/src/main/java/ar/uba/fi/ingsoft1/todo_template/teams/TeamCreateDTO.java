package ar.uba.fi.ingsoft1.todo_template.teams;

import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.HashSet;

public record TeamCreateDTO(
        String name,
        @NotNull String leader,
        HashSet<String> memberEmails
) {
    public Team toTeam() {
        return new Team(name, leader, memberEmails);
    }
}