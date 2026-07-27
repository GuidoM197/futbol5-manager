package ar.uba.fi.ingsoft1.todo_template.reservations;

import ar.uba.fi.ingsoft1.todo_template.fields.SoccerField;
import ar.uba.fi.ingsoft1.todo_template.fields.SoccerFieldService;
import ar.uba.fi.ingsoft1.todo_template.matches.MatchService;
import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamService;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserService userService;

    @Mock
    private SoccerFieldService soccerFieldService;

    @Mock
    private TeamService teamService;

    @Mock
    private MatchService matchService;

    @InjectMocks
    private ReservationService reservationService;

    private SoccerField field;
    private User user;
    private Team team1;
    private Team team2;

    @BeforeEach
    void setUp() {
        field = new SoccerField("Cancha 1", "Buenos Aires", "Bermuda", "admin@a.com", "owner@a.com", 9, 17);
        user = new User("John", "Doe", "user@a.com", null, "25", "M", "Buenos Aires", "plainPassword", "USER");
        team1 = new Team("Team A", "leader1", new HashSet<>(List.of("a@a.com", "b@b.com")));
        team2 = new Team("Team B", "leader2", new HashSet<>(List.of("c@c.com", "d@d.com")));
    }

    @Test
    void testCreateReservation_SuccessfulCreation() {
        HashSet<String> team1Emails = new HashSet<>(team1.getMemberEmails());
        HashSet<String> team2Emails = new HashSet<>(team2.getMemberEmails());

        ReservationCreateDTO dto = new ReservationCreateDTO(
                "user@example.com", "Cancha 1", LocalDate.now(), 10, 11,
                "Friendly", team1Emails, team2Emails
        );

        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(soccerFieldService.findByName("Cancha 1")).thenReturn(Optional.of(field));
        when(teamService.findTeamByMembers(team1Emails)).thenReturn(Optional.of(team1));
        when(teamService.findTeamByMembers(team2Emails)).thenReturn(Optional.of(team2));
        when(matchService.differents_emails(team1, team2)).thenReturn(true);
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Optional<Reservation> result = reservationService.createReservation(dto);

        assertTrue(result.isPresent());
        assertEquals("Buenos Aires", result.get().getField().getLocation());
        verify(reservationRepository).save(any());
    }

    @Test
    void testCreateReservation_InvalidHourFails() {
        ReservationCreateDTO dto = new ReservationCreateDTO(
                "user@example.com", "Cancha 1", LocalDate.now(), 18, 19,
                "Friendly", new HashSet<>(), new HashSet<>()
        );

        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(soccerFieldService.findByName("Cancha 1")).thenReturn(Optional.of(field));
        when(teamService.createTeam(any())).thenReturn(Optional.of(team1));

        Optional<Reservation> result = reservationService.createReservation(dto);

        assertTrue(result.isEmpty());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testCreateReservation_UserLocationMismatch() {
        User mismatchedUser = new User("John", "Doe", "user@a.com", null, "25", "M", "Mendoza", "plainPassword", "USER");

        ReservationCreateDTO dto = new ReservationCreateDTO(
                "user@example.com", "Cancha 1", LocalDate.now(), 10, 11,
                "Friendly", new HashSet<>(), new HashSet<>()
        );

        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(mismatchedUser));
        when(soccerFieldService.findByName("Cancha 1")).thenReturn(Optional.of(field));
        when(teamService.createTeam(any())).thenReturn(Optional.of(team1));

        Optional<Reservation> result = reservationService.createReservation(dto);

        assertTrue(result.isEmpty());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testGetAvailableHours_ReturnsCorrectHours() {
        // Setup
        LocalDate today = LocalDate.now();
        SoccerField field = new SoccerField();
        field.setName("Cancha 1");
        field.setStartTime(9);
        field.setEndTime(12);

        Reservation existingReservation = new Reservation();
        existingReservation.setField(field);
        existingReservation.setDay(today);
        existingReservation.setStartHour(10);
        existingReservation.setEndHour(11);

        when(soccerFieldService.findByName("Cancha 1")).thenReturn(Optional.of(field));
        when(reservationRepository.findByFieldAndDay(field, today)).thenReturn(List.of(existingReservation));

        // Act
        List<Integer> availableHours = reservationService.getAvailableHours("Cancha 1", today);

        // Assert
        assertEquals(List.of(9, 11), availableHours);
    }

    @Test
    void testGetUserReservations_ReturnsUserReservations() {
        // Setup
        Reservation reservation = new Reservation();
        reservation.setStartHour(10);
        reservation.setEndHour(11);
        reservation.setDay(LocalDate.now());

        when(reservationRepository.findReservationByUserEmail("user@example.com"))
                .thenReturn(List.of(reservation));

        // Act
        List<Reservation> result = reservationService.getUserReservations("user@example.com");

        // Assert
        assertEquals(1, result.size());
        assertEquals(10, result.getFirst().getStartHour());
    }

}