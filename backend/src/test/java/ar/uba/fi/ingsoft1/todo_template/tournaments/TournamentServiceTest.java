package ar.uba.fi.ingsoft1.todo_template.tournaments;

import ar.uba.fi.ingsoft1.todo_template.teams.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TournamentServiceTest {

    private TournamentRepository tournamentRepository;
    private TeamRepository teamRepository;
    private TournamentService tournamentService;

    @BeforeEach
    void setUp() {
        tournamentRepository = mock(TournamentRepository.class);
        tournamentService = new TournamentService(tournamentRepository, teamRepository);
    }

    @Test
    void createTournament_shouldCreateTournamentSuccessfully() {
        String organizerEmail = "organizer@example.com";
        TournamentCreateDTO dto = new TournamentCreateDTO(
                "New Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().plusDays(5),
                "New Description",
                "Medals",
                100.0
        );

        when(tournamentRepository.existsByName("New Tournament")).thenReturn(false);
        ArgumentCaptor<Tournament> captor = ArgumentCaptor.forClass(Tournament.class);
        when(tournamentRepository.save(any(Tournament.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Tournament> result = tournamentService.createTournament(dto, organizerEmail);

        assertTrue(result.isPresent());
        verify(tournamentRepository).save(captor.capture());
        Tournament saved = captor.getValue();
        assertEquals("New Tournament", saved.getName());
        assertEquals(organizerEmail, saved.getOrganizerEmail());
    }

    @Test
    void createTournament_shouldReturnEmpty_ifNameAlreadyExists() {
        TournamentCreateDTO dto = new TournamentCreateDTO(
                "Existing Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().plusDays(5),
                "New Description",
                "Medals",
                100.0
        );

        when(tournamentRepository.existsByName("Existing Tournament")).thenReturn(true);

        Optional<Tournament> result = tournamentService.createTournament(dto, "someone@example.com");

        assertTrue(result.isEmpty());
        verify(tournamentRepository, never()).save(any());
    }

    @Test
    void createTournament_shouldThrow_ifEndDateBeforeStartDate() {
        TournamentCreateDTO dto = new TournamentCreateDTO(
                "Bad Dates Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().minusDays(1),
                "New Description",
                "Medals",
                100.0
        );

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> tournamentService.createTournament(dto, "org@example.com"));
        assertEquals("End date cannot be before start date", exception.getMessage());
        verify(tournamentRepository, never()).save(any());
    }

    @Test
    void updateTournament_shouldUpdateTournamentAndReturnUpdatedInstance() {
        Long tournamentId = 1L;
        String organizerEmail = "organizer@example.com";

        TournamentCreateDTO dto = new TournamentCreateDTO(
                "New Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().plusDays(5),
                "New Description",
                "Medals",
                100.0
        );

        Tournament existingTournament = new Tournament(
                "Original Name",
                LocalDate.now().minusDays(3),
                TournamentFormat.SINGLE_ELIMINATION,
                4,
                organizerEmail
        );

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(existingTournament));
        when(tournamentRepository.existsByName(dto.name())).thenReturn(false);
        when(tournamentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Tournament> result = tournamentService.updateTournament(tournamentId, dto, organizerEmail);

        assertTrue(result.isPresent());
        Tournament updated = result.get();
        assertEquals(dto.name(), updated.getName());
        assertEquals(dto.format(), updated.getFormat());
        assertEquals(dto.maxTeams(), updated.getMaxTeams());
        assertEquals(dto.endDate(), updated.getEndDate());
        assertEquals(dto.description(), updated.getDescription());
        assertEquals(dto.prizes(), updated.getPrizes());
        assertEquals(dto.registrationCost(), updated.getRegistrationCost());
    }

    @Test
    void updateTournament_shouldThrowException_ifUserIsNotOrganizer() {
        Long tournamentId = 1L;
        String actualOrganizer = "organizer@example.com";
        String otherUser = "notorganizer@example.com";

        TournamentCreateDTO dto = new TournamentCreateDTO(
                "New Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().plusDays(5),
                "Description",
                "Prizes",
                100.0
        );

        Tournament tournament = new Tournament(
                "Original Name",
                LocalDate.now().minusDays(3),
                TournamentFormat.SINGLE_ELIMINATION,
                4,
                actualOrganizer
        );

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                tournamentService.updateTournament(tournamentId, dto, otherUser)
        );

        assertEquals("Only the organizer can update the tournament", exception.getMessage());
    }

    @Test
    void updateTournament_shouldThrowException_ifTournamentIsNotEditable() {
        Long tournamentId = 1L;
        String organizer = "organizer@example.com";

        TournamentCreateDTO dto = new TournamentCreateDTO(
                "New Tournament",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                LocalDate.now().plusDays(5),
                "Description",
                "Prizes",
                100.0
        );

        Tournament tournament = new Tournament(
                "Old Tournament",
                LocalDate.now().minusDays(3),
                TournamentFormat.ROUND_ROBIN,
                4,
                organizer
        );
        tournament.setStatus(TournamentStatus.IN_PROGRESS); // ya no se puede editar

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                tournamentService.updateTournament(tournamentId, dto, organizer)
        );

        assertEquals("Tournament cannot be edited in its current state", exception.getMessage());
    }

    @Test
    void deleteTournament_shouldDelete_ifOrganizerAndEditable() {
        Long tournamentId = 1L;
        String organizer = "organizer@example.com";

        Tournament tournament = new Tournament(
                "Tournament Name",
                LocalDate.now().plusDays(5),
                TournamentFormat.ROUND_ROBIN,
                8,
                organizer
        );

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        boolean result = tournamentService.deleteTournament(tournamentId, organizer);

        assertTrue(result);
        verify(tournamentRepository).delete(tournament);
    }

    @Test
    void deleteTournament_shouldReturnFalse_ifUserIsNotOrganizer() {
        Long tournamentId = 1L;
        String actualOrganizer = "organizer@example.com";
        String otherUser = "notorganizer@example.com";

        Tournament tournament = new Tournament(
                "Tournament Name",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                actualOrganizer
        );

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        boolean result = tournamentService.deleteTournament(tournamentId, otherUser);

        assertFalse(result);
        verify(tournamentRepository, never()).delete(any());
    }

    @Test
    void deleteTournament_shouldReturnFalse_ifTournamentIsNotEditable() {
        Long tournamentId = 1L;
        String organizer = "organizer@example.com";

        Tournament tournament = new Tournament(
                "Tournament Name",
                LocalDate.now(),
                TournamentFormat.ROUND_ROBIN,
                8,
                organizer
        );
        tournament.setStatus(TournamentStatus.IN_PROGRESS); // ya no se puede borrar

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        boolean result = tournamentService.deleteTournament(tournamentId, organizer);

        assertFalse(result);
        verify(tournamentRepository, never()).delete(any());
    }

}
