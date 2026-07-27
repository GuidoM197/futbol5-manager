package ar.uba.fi.ingsoft1.todo_template.tournaments;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Tournament data transfer object")
public record TournamentDTO(
        @Schema(description = "Unique identifier of the tournament", example = "123")
        Long id,
        @Schema(description = "Name of the tournament", example = "Summer Soccer League 2024")
        String name,
        @Schema(description = "Start date of the tournament", example = "2024-06-15")
        LocalDate startDate,
        @Schema(description = "End date of the tournament (optional)", example = "2024-08-15")
        LocalDate endDate,
        @Schema(description = "Format of the tournament", example = "LEAGUE")
        TournamentFormat format,
        @Schema(description = "Maximum number of teams allowed", example = "16")
        Integer maxTeams,
        @Schema(description = "Email of the tournament organizer", example = "organizer@example.com")
        String organizerEmail,
        @Schema(description = "Current status of the tournament", example = "OPEN_FOR_REGISTRATION")
        TournamentStatus status,
        @Schema(description = "Description of the tournament", example = "A competitive summer soccer league for amateur players")
        String description,
        @Schema(description = "Prizes for the tournament winners", example = "1st Place: $1000, 2nd Place: $500")
        String prizes,
        @Schema(description = "Registration cost per team", example = "50.0")
        Double registrationCost,
        @Schema(description = "Timestamp when the tournament was created", example = "2024-01-15T10:30:00")
        LocalDateTime createdAt,
        @Schema(description = "Timestamp when the tournament was last updated", example = "2024-01-15T10:30:00")
        LocalDateTime updatedAt
) {
    public static TournamentDTO fromTournament(Tournament tournament) {
        return new TournamentDTO(
                tournament.getId(),
                tournament.getName(),
                tournament.getStartDate(),
                tournament.getEndDate(),
                tournament.getFormat(),
                tournament.getMaxTeams(),
                tournament.getOrganizerEmail(),
                tournament.getStatus(),
                tournament.getDescription(),
                tournament.getPrizes(),
                tournament.getRegistrationCost(),
                tournament.getCreatedAt(),
                tournament.getUpdatedAt()
        );
    }
} 