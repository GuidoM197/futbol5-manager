package ar.uba.fi.ingsoft1.todo_template.matches;

import static org.junit.jupiter.api.Assertions.*;

import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import org.junit.jupiter.api.Test;

import java.util.HashSet;

class MatchServiceTest {

    @Test
    void testCreateMatch_WithPublicTypeAndValidTeams() {
        Team team1 = new Team("Equipo 1", "user@example.com", new HashSet<>());
        Team team2 = new Team("Equipo 2", "user@example.com", new HashSet<>());

        Match match = new Match("PUBLIC", team1, team2, "organizer@example.com");

        assertEquals(MatchType.PUBLIC, match.getType());
        assertEquals(team1, match.getFirstTeam());
        assertEquals(team2, match.getSecondTeam());
        assertFalse(match.isConfirmed());
    }

    @Test
    void testCreateMatch_WithInvalidTypeAndNullTeams() {
        Match match = new Match("INVALID_TYPE", null, null, "organizer@example.com");

        assertNull(match.getType());
        assertNotNull(match.getFirstTeam());
        assertNotNull(match.getSecondTeam());
        assertEquals("organizer@example.com", match.getFirstTeam().getLeader());
    }

    @Test
    void testMatchConfirm_SetsConfirmedTrue() {
        Team team1 = new Team("Team A", "leaderA@example.com", new HashSet<>());
        Team team2 = new Team("Team B", "leaderB@example.com", new HashSet<>());

        Match match = new Match("PRIVATE", team1, team2, "organizer@example.com");

        assertFalse(match.isConfirmed());

        match.confirm();

        assertTrue(match.isConfirmed());
    }
}