package ar.uba.fi.ingsoft1.todo_template.tournaments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Future;
import java.time.LocalDate;

public record TournamentCreateDTO(
        @NotBlank(message = "Tournament name is required")
        String name,
        
        @NotNull(message = "Start date is required")
        @Future(message = "Start date must be in the future")
        LocalDate startDate,
        
        @NotNull(message = "Tournament format is required")
        TournamentFormat format,
        
        @NotNull(message = "Maximum number of teams is required")
        @Min(value = 2, message = "At least 2 teams are required")
        Integer maxTeams,
        
        // Optional fields
        LocalDate endDate,
        String description,
        String prizes,
        Double registrationCost
) {
    public Tournament toTournament(String organizerEmail) {
        Tournament tournament = new Tournament(name, startDate, format, maxTeams, organizerEmail);
        tournament.setEndDate(endDate);
        tournament.setDescription(description);
        tournament.setPrizes(prizes);
        tournament.setRegistrationCost(registrationCost);
        return tournament;
    }
} 