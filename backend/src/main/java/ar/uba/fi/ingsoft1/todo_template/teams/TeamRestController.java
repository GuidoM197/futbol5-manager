package ar.uba.fi.ingsoft1.todo_template.teams;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/game")
@Tag(name = "4 - Game")
public class TeamRestController {
    private final TeamService teamService;

    @Autowired
    TeamRestController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping(value = "create", produces = "application/json")
    @Operation(summary = "Create a new Team")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<Team> createNewTeam(
            @Valid @RequestBody TeamCreateDTO dto
    ) throws MethodArgumentNotValidException {
        System.out.println("DTO: " + dto);
        return teamService.createTeam(dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @GetMapping(value = "/my-teams", produces = "application/json")
    @Operation(summary = "Get teams where the user is a member")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Team>> getMyTeams(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        List<Team> teams = teamService.findTeamsByMemberEmail(email);
        return ResponseEntity.ok(teams);
    }

    @GetMapping(value = "/my-led-teams/{email}", produces = "application/json")
    public ResponseEntity<List<Team>> getTeamsLedByUser(
            @PathVariable String email
    ) {
        System.out.println("email: " + email);
        List<Team> teams = teamService.findTeamsByLeaderEmail(email);
        System.out.println("teams: " + teams);
        return ResponseEntity.ok(teams);
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email) {
        if (teamService.deleteTeamByLeader(id, email)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Team> updateTeam(
            @PathVariable Long id,
            @RequestBody TeamCreateDTO dto,
            @AuthenticationPrincipal(expression = "username") String email) {
        return teamService.updateTeamByLeader(id, dto, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }
}
