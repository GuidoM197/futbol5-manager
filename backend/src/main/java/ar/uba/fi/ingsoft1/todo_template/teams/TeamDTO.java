package ar.uba.fi.ingsoft1.todo_template.teams;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;

public record TeamDTO(
        @NotNull String name,
        @NotNull String leader,
        @NotNull ArrayList<String> memberEmails
) {}
