package ar.uba.fi.ingsoft1.todo_template.reservations;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.HashSet;

public record ReservationCreateDTO(
        @NotNull String userEmail,
        @NotNull String fieldName,
        @NotNull LocalDate day,
        @NotNull int startHour,
        @NotNull int endHour,
        @NotNull String type,
        HashSet<String> teamEmails1,
        HashSet<String> teamEmails2
) {
}