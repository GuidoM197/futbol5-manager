package ar.uba.fi.ingsoft1.todo_template.tournaments;

import jakarta.validation.constraints.NotNull;

public record TournamentStatusUpdateDTO(
        @NotNull(message = "Tournament status is required")
        TournamentStatus status
) {
} 