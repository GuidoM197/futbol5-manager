package ar.uba.fi.ingsoft1.todo_template.matches;

import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Match data transfer object")
public record MatchDTO(
        @Schema(description = "Unique identifier of the match", example = "123")
        @NotNull Long id,
        @Schema(description = "Name of the soccer field", example = "Central Stadium")
        @NotNull String fieldName,
        @Schema(description = "Location of the soccer field", example = "123 Main Street, City Center")
        @NotNull String fieldLocation,
        @Schema(description = "Start time of the match", example = "2024-06-15T14:00:00")
        @NotNull LocalDateTime startTime,
        @Schema(description = "End time of the match", example = "2024-06-15T16:00:00")
        @NotNull LocalDateTime endTime,
        @Schema(description = "First team participating in the match")
        @NotNull Team firstTeam,
        @Schema(description = "Second team participating in the match")
        @NotNull Team secondTeam,
        @Schema(description = "Email of the match organizer", example = "organizer@example.com")
        @NotNull String organizerEmail,
        @Schema(description = "Number of players missing from the first team to reach 5 players", example = "2")
        @NotNull int firstTeamMissing,
        @Schema(description = "Number of players missing from the second team to reach 5 players", example = "1")
        @NotNull int secondTeamMissing,
        @Schema(description = "Whether the match is confirmed by all participants", example = "false")
        @NotNull boolean confirmed
) {}