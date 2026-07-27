package ar.uba.fi.ingsoft1.todo_template.tournaments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tournaments")
@Tag(name = "5 - Tournaments")
public class TournamentRestController {

    private final TournamentService tournamentService;

    @Autowired
    public TournamentRestController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new tournament")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TournamentDTO> createTournament(
            @Valid @RequestBody TournamentCreateDTO dto,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        try {
            return tournamentService.createTournament(dto, email)
                    .map(tournament -> ResponseEntity.status(HttpStatus.CREATED).body(TournamentDTO.fromTournament(tournament)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/my-tournaments", produces = "application/json")
    @Operation(summary = "Get tournaments organized by the current user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TournamentDTO>> getMyTournaments(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        List<Tournament> tournaments = tournamentService.findTournamentsByOrganizer(email);
        List<TournamentDTO> tournamentDTOs = tournaments.stream()
                .map(TournamentDTO::fromTournament)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tournamentDTOs);
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get all tournaments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TournamentDTO>> getAllTournaments() {
        List<Tournament> tournaments = tournamentService.findAllTournaments();
        List<TournamentDTO> tournamentDTOs = tournaments.stream()
                .map(TournamentDTO::fromTournament)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tournamentDTOs);
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get tournament by ID")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TournamentDTO> getTournamentById(@PathVariable Long id) {
        return tournamentService.findTournamentById(id)
                .map(tournament -> ResponseEntity.ok(TournamentDTO.fromTournament(tournament)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update tournament")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TournamentDTO> updateTournament(
            @PathVariable Long id,
            @Valid @RequestBody TournamentCreateDTO dto,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        try {
            return tournamentService.updateTournament(id, dto, email)
                    .map(tournament -> ResponseEntity.ok(TournamentDTO.fromTournament(tournament)))
                    .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Delete tournament")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (tournamentService.deleteTournament(id, email)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PatchMapping(value = "/{id}/status", produces = "application/json")
    @Operation(summary = "Update tournament status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TournamentDTO> updateTournamentStatus(
            @PathVariable Long id,
            @RequestBody TournamentStatusUpdateDTO statusUpdate,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        try {
            return tournamentService.updateTournamentStatus(id, statusUpdate.status(), email)
                    .map(tournament -> ResponseEntity.ok(TournamentDTO.fromTournament(tournament)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping(value = "/status/{status}", produces = "application/json")
    @Operation(summary = "Get tournaments by status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TournamentDTO>> getTournamentsByStatus(@PathVariable TournamentStatus status) {
        List<Tournament> tournaments = tournamentService.findTournamentsByStatus(status);
        List<TournamentDTO> tournamentDTOs = tournaments.stream()
                .map(TournamentDTO::fromTournament)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tournamentDTOs);
    }

    @GetMapping(value = "/search", produces = "application/json")
    @Operation(
        summary = "Search tournaments with filters",
        description = "Search tournaments using various filters. All parameters are optional. " +
                     "If multiple filters are provided, tournaments must match ALL specified criteria. " +
                     "Results are ordered by creation date (newest first)."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved filtered tournaments",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = TournamentDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - User does not have USER role",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request - Invalid filter parameters",
            content = @Content
        )
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TournamentDTO>> searchTournaments(
            @Parameter(
                description = "Tournament name to search for (partial match, case-insensitive)",
                required = false,
                example = "Summer League"
            )
            @RequestParam(required = false) String name,
            @Parameter(
                description = "Tournament format filter",
                required = false,
                schema = @Schema(implementation = TournamentFormat.class),
                example = "LEAGUE"
            )
            @RequestParam(required = false) TournamentFormat format,
            @Parameter(
                description = "Tournament status filter",
                required = false,
                schema = @Schema(implementation = TournamentStatus.class),
                example = "OPEN_FOR_REGISTRATION"
            )
            @RequestParam(required = false) TournamentStatus status,
            @Parameter(
                description = "Tournament start date filter (format: YYYY-MM-DD)",
                required = false,
                example = "2024-06-15"
            )
            @RequestParam(required = false) LocalDate startDate
    ) {
        List<Tournament> tournaments = tournamentService.searchTournaments(name, format, status, startDate);
        List<TournamentDTO> dtos = tournaments.stream()
                .map(TournamentDTO::fromTournament)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{tournamentId}/enroll/{teamId}")
    @Operation(
        summary = "Enroll a team in a tournament",
        description = "Enrolls a team in a tournament. The authenticated user must be the captain of the team. " +
                     "The tournament must be open for registration and have available slots. " +
                     "A team can only be enrolled once in the same tournament."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully enrolled team in tournament",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = TournamentDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request - Various enrollment validation errors",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(implementation = String.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Tournament not found",
                        value = "Tournament not found"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Tournament not open",
                        value = "Tournament is not open for registration"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Tournament full",
                        value = "Tournament has reached the maximum number of teams"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Team not found",
                        value = "Team not found"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Not team captain",
                        value = "Only the team captain can enroll the team"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Already enrolled",
                        value = "Team is already enrolled in this tournament"
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - User not authenticated",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - User does not have USER role",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Tournament or team not found",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(implementation = String.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        value = "Tournament not found"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        value = "Team not found"
                    )
                }
            )
        )
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> enrollTeamInTournament(
            @Parameter(
                description = "ID of the tournament to enroll in",
                required = true,
                example = "123"
            )
            @PathVariable Long tournamentId,
            @Parameter(
                description = "ID of the team to enroll",
                required = true,
                example = "456"
            )
            @PathVariable Long teamId,
            @Parameter(
                description = "Email of the authenticated user (automatically extracted from JWT token)",
                required = true,
                example = "captain@example.com"
            )
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        try {
            Tournament updatedTournament = tournamentService.enrollTeam(tournamentId, teamId, email);
            TournamentDTO dto = TournamentDTO.fromTournament(updatedTournament);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}