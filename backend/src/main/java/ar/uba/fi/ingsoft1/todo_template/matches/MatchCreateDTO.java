package ar.uba.fi.ingsoft1.todo_template.matches;

import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import jakarta.validation.constraints.*;

public record MatchCreateDTO(
        @NotNull String type,
        @NotNull Team team1,
        @NotNull Team team2,
        @NotBlank String organizerEmail
) {
    public Match toGame() {
        return new Match(type, team1, team2, organizerEmail);
    }
}