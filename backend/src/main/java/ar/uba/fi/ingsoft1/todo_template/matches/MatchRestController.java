package ar.uba.fi.ingsoft1.todo_template.matches;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/game")
@Tag(name = "4 - Game")
public class MatchRestController {

    private final MatchService matchService;

    @Autowired
    MatchRestController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new Public Game")
    @ResponseStatus(HttpStatus.CREATED)
    ResponseEntity<Match> createPublicGame(
            @Valid @RequestBody MatchCreateDTO dto
    ) throws MethodArgumentNotValidException {
        return matchService.createMatch(dto)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team capacity must be at least 5"));
    }

    @GetMapping(value = "/public", produces = "application/json")
    @Operation(summary = "Get all public games")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER')")
    Page<MatchDTO> getAllPublicGames(
            @ParameterObject Pageable pageable
    ) throws MethodArgumentNotValidException {
        return matchService.getAllPublicMatches(pageable);
    }

    @PostMapping("/join/{matchId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> joinMatch(@PathVariable Long matchId,
                                       @AuthenticationPrincipal(expression = "username") String email) {
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            Match updatedMatch = matchService.joinMatch(matchId, email);
            MatchDTO dto = matchService.convertToDTO(updatedMatch);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/confirm/{matchId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> confirmParticipation(@PathVariable Long matchId,
                                                  @AuthenticationPrincipal(expression = "username") String email) {
        try {
            Match updatedMatch = matchService.confirmParticipation(matchId, email);
            MatchDTO dto = matchService.convertToDTO(updatedMatch);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/leave/{matchId}")
    @Operation(
        summary = "Leave a public match",
        description = "Allows a user to leave a public match they have joined. " +
                     "The user must be currently part of the match to leave it. " +
                     "If the match was confirmed and the user leaving reduces the total players below 10, " +
                     "the match will be unconfirmed and pending confirmations will be reset. " +
                     "Only unconfirmed matches can be left."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully left the match",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MatchDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request - User is not part of this match, match is not public, or match is already confirmed",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(implementation = String.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Not part of match",
                        value = "User is not part of this match"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Match not public",
                        value = "Match is not public"
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Match confirmed",
                        value = "Cannot leave a confirmed match"
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - User not authenticated",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(implementation = String.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        value = "User not authenticated"
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - User does not have USER role",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Match not found",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(implementation = String.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        value = "Match not found"
                    )
                }
            )
        )
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> leaveMatch(
            @Parameter(
                description = "ID of the match to leave",
                required = true,
                example = "123"
            )
            @PathVariable Long matchId,
            @Parameter(
                description = "Email of the authenticated user (automatically extracted from JWT token)",
                required = true,
                example = "user@example.com"
            )
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            Match updatedMatch = matchService.leaveMatch(matchId, email);
            MatchDTO dto = matchService.convertToDTO(updatedMatch);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}