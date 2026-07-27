package ar.uba.fi.ingsoft1.todo_template.reservations;

import ar.uba.fi.ingsoft1.todo_template.fields.SoccerField;
import ar.uba.fi.ingsoft1.todo_template.fields.SoccerFieldService;
import ar.uba.fi.ingsoft1.todo_template.matches.MatchService;
import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamService;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class ReservationService {
    final int START_RESERVATION = 9;
    final int END_RESERVATION = 17;

    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final SoccerFieldService soccerFieldService;
    private final TeamService teamService;
    private final MatchService matchService;

    @Autowired
    public ReservationService(
            ReservationRepository reservationRepository,
            UserService userService,
            SoccerFieldService soccerFieldService, TeamService teamService, MatchService matchService
    ) {
        this.reservationRepository = reservationRepository;
        this.userService = userService;
        this.soccerFieldService = soccerFieldService;
        this.teamService = teamService;
        this.matchService = matchService;
    }

    public Optional<Reservation> createReservation(ReservationCreateDTO dto) {
        var userOpt = userService.findByEmail(dto.userEmail());
        if (userOpt.isEmpty()) return Optional.empty();

        var fieldOpt = soccerFieldService.findByName(dto.fieldName());
        if (fieldOpt.isEmpty()) return Optional.empty();

        Team team1;
        Team team2;
        if (dto.teamEmails1().isEmpty() || dto.teamEmails2().isEmpty()) {
            team1 = teamService.createTeam(new TeamCreateDTO(null, null, new HashSet<>())).orElse(null);
            team2 = teamService.createTeam(new TeamCreateDTO(null, null, new HashSet<>())).orElse(null);
        } else {
            team1 = teamService.findTeamByMembers(dto.teamEmails1()).orElse(null);
            team2 = teamService.findTeamByMembers(dto.teamEmails2()).orElse(null);
        }
        if (!matchService.differents_emails(team1, team2)) {
            return Optional.empty();
        }

        var user = userOpt.get();
        var field = fieldOpt.get();

        if (!user.getLocation().equalsIgnoreCase(field.getLocation())) {
            return Optional.empty();
        }

        if (!isReservationValid(dto)) {
            return Optional.empty();
        }
        Reservation reservation = new Reservation(
                dto.userEmail(),
                field,
                dto.day(),
                dto.startHour(),
                dto.endHour(),
                dto.type(),
                team1,
                team2
        );

        reservationRepository.save(reservation);
        return Optional.of(reservation);
    }

    public List<Integer> getAvailableHours(String fieldName, LocalDate day) {
        Optional<SoccerField> fieldOpt = soccerFieldService.findByName(fieldName);
        if (fieldOpt.isEmpty()) {
            return Collections.emptyList();
        }
        SoccerField field = fieldOpt.get();

        List<Reservation> reservations = reservationRepository.findByFieldAndDay(field, day);

        int startTime = field.getStartTime() != null ? field.getStartTime() : START_RESERVATION;
        int endTime = field.getEndTime() != null ? field.getEndTime() : END_RESERVATION;

        List<Integer> availableHours = new ArrayList<>();
        for (int hour = startTime; hour < endTime; hour++) {
            availableHours.add(hour);
        }

        for (Reservation reservation : reservations) {
            for (int hour = reservation.getStartHour(); hour < reservation.getEndHour(); hour++) {
                availableHours.remove(Integer.valueOf(hour));
            }
        }

        return availableHours;
    }

    public List<Reservation> getUserReservations(String userEmail) {
        List<Reservation> reservations = reservationRepository.findReservationByUserEmail(userEmail);
        if (reservations.isEmpty()) {
            return Collections.emptyList();
        }
        return reservations;
    }

    private boolean isReservationValid(ReservationCreateDTO dto) {
        var fieldOpt = soccerFieldService.findByName(dto.fieldName());
        if (fieldOpt.isEmpty()) return false;

        SoccerField field = fieldOpt.get();
        int startTime = field.getStartTime() != null ? field.getStartTime() : START_RESERVATION;
        int endTime = field.getEndTime() != null ? field.getEndTime() : END_RESERVATION;

        if (dto.startHour() < startTime || dto.startHour() > (endTime - 1)) return false;
        if (dto.endHour() != dto.startHour() + 1 || dto.endHour() > endTime) return false;
        return true;
    }
}
