package ar.uba.fi.ingsoft1.todo_template.teams;

import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TeamServiceTest {
    private TeamRepository teamRepository;
    private UserService userService;
    private TeamService teamService;

    @BeforeEach
    void setUp() {
        teamRepository = mock(TeamRepository.class);
        userService = mock(UserService.class);
        teamService = new TeamService(teamRepository, userService);
    }

    @Test
    void createTeam_shouldCreateTeam_whenDataIsValid() {
        TeamCreateDTO dto = new TeamCreateDTO("Team-A", "leader@example.com", new HashSet<>(List.of("member1@example.com", "member2@example.com")));

        when(teamRepository.existsByTeamName("Team-A")).thenReturn(false);
        when(userService.checkMembersRole(dto)).thenReturn(true);

        Optional<Team> result = teamService.createTeam(dto);

        assertTrue(result.isPresent());
        assertEquals("Team-A", result.get().getTeamName());
        verify(teamRepository).save(any(Team.class));
    }

    @Test
    void createTeam_shouldReturnEmpty_whenTeamNameAlreadyExists() {
        TeamCreateDTO dto = new TeamCreateDTO("Team-Existing", "leader@example.com", new HashSet<>(List.of("member@example.com")));

        when(teamRepository.existsByTeamName("Team-Existing")).thenReturn(true);

        Optional<Team> result = teamService.createTeam(dto);

        assertTrue(result.isEmpty());
        verify(teamRepository, never()).save(any());
    }

    @Test
    void createTeam_shouldReturnEmpty_whenMembersHaveInvalidRole() {
        TeamCreateDTO dto = new TeamCreateDTO("Team-Role", "leader@example.com", new HashSet<>(List.of("invalid@example.com")));

        when(teamRepository.existsByTeamName("Team-Role")).thenReturn(false);
        when(userService.checkMembersRole(dto)).thenReturn(false);

        Optional<Team> result = teamService.createTeam(dto);

        assertTrue(result.isEmpty());
        verify(teamRepository, never()).save(any());
    }

    @Test
    void updateTeamByLeader_shouldUpdateTeam_whenLeaderMatchesAndDataIsValid() {
        Long teamId = 1L;
        Team existingTeam = new Team("Team-Old", "leader@example.com", new HashSet<>(List.of("old1@example.com", "old2@example.com")));
        existingTeam.setMemberEmails(new HashSet<>(List.of("old1@example.com", "old2@example.com")));

        TeamCreateDTO dto = new TeamCreateDTO("Team-Updated", "new-leader@example.com", new HashSet<>(List.of("m1@example.com", "m2@example.com", "m3@example.com", "m4@example.com", "m5@example.com")));

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(existingTeam));
        when(userService.checkMembersRole(dto)).thenReturn(true);
        when(userService.checkMembersLocation(dto)).thenReturn(true);

        Optional<Team> result = teamService.updateTeamByLeader(teamId, dto, "leader@example.com");

        assertTrue(result.isPresent());
        assertEquals("new-leader@example.com", result.get().getLeader());
        assertEquals(5, result.get().getMemberEmails().size());
        verify(teamRepository).save(existingTeam);
    }

    @Test
    void updateTeamByLeader_shouldReturnEmpty_whenLeaderDoesNotMatch() {
        Long teamId = 1L;
        Team existingTeam = new Team("Team-Old", "correct-leader@example.com", new HashSet<>(List.of("a@example.com")));

        TeamCreateDTO dto = new TeamCreateDTO("Team-Updated", "new-leader@example.com", new HashSet<>(List.of("x@example.com", "y@example.com", "z@example.com", "w@example.com", "q@example.com")));

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(existingTeam));

        Optional<Team> result = teamService.updateTeamByLeader(teamId, dto, "wrong-leader@example.com");

        assertTrue(result.isEmpty());
        verify(teamRepository, never()).save(any());
    }

    @Test
    void updateTeamByLeader_shouldReturnEmpty_whenInvalidNumberOfMembers() {
        Long teamId = 1L;
        Team existingTeam = new Team("Team-Old", "leader@example.com", new HashSet<>(List.of("a@example.com")));

        TeamCreateDTO dto = new TeamCreateDTO("Team-Updated", "new-leader@example.com", new HashSet<>(List.of("x@example.com", "y@example.com"))); // Solo 2 miembros

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(existingTeam));
        when(userService.checkMembersRole(dto)).thenReturn(true);
        when(userService.checkMembersLocation(dto)).thenReturn(true);

        Optional<Team> result = teamService.updateTeamByLeader(teamId, dto, "leader@example.com");

        assertTrue(result.isEmpty());
        verify(teamRepository, never()).save(any());
    }

    @Test
    void deleteTeamByLeader_shouldDeleteTeam_whenLeaderMatches() {
        Long teamId = 1L;
        Team team = new Team("Team-Test", "leader@example.com", new HashSet<>(List.of("m1@example.com")));

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        boolean result = teamService.deleteTeamByLeader(teamId, "leader@example.com");

        assertTrue(result);
        verify(teamRepository).deleteById(teamId);
    }

    @Test
    void deleteTeamByLeader_shouldNotDelete_whenLeaderDoesNotMatch() {
        Long teamId = 1L;
        Team team = new Team("Team-Test", "correct-leader@example.com", new HashSet<>(List.of("m1@example.com")));

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        boolean result = teamService.deleteTeamByLeader(teamId, "wrong-leader@example.com");

        assertFalse(result);
        verify(teamRepository, never()).deleteById(any());
    }

    @Test
    void deleteTeamByLeader_shouldNotDelete_whenTeamNotFound() {
        Long teamId = 999L;

        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        boolean result = teamService.deleteTeamByLeader(teamId, "leader@example.com");

        assertFalse(result);
        verify(teamRepository, never()).deleteById(any());
    }

}