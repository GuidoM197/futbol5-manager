package ar.uba.fi.ingsoft1.todo_template.matches;

import ar.uba.fi.ingsoft1.todo_template.reservations.Reservation;
import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Set;
import java.util.HashSet;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class MatchService {
    private final MatchRepository matchRepository;

    @Autowired
    MatchService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    public Optional<Match> createMatch(@Valid MatchCreateDTO dto) {
        Match match = dto.toGame();
        matchRepository.save(match);
        return Optional.of(match);
    }

    public Page<MatchDTO> getAllPublicMatches(Pageable pageable) {
        Page<Match> matches = matchRepository.findByType(MatchType.PUBLIC, pageable);
        return matches.map(this::convertToDTO);
    }

    public MatchDTO convertToDTO(Match match) {
        Reservation reservation = match.getReservation();
        if (reservation == null) {
            throw new IllegalStateException("Match without reservation");
        }
        String fieldName = reservation.getField().getName();
        String fieldLocation = reservation.getField().getLocation();
        LocalDateTime startTime = reservation.getDay().atTime(reservation.getStartHour(), 0);
        LocalDateTime endTime = reservation.getDay().atTime(reservation.getEndHour(), 0);

        int firstTeamSize = match.getFirstTeam().getMemberEmails().size();
        int secondTeamSize = match.getSecondTeam().getMemberEmails().size();
        int firstTeamMissing = 5 - firstTeamSize;
        int secondTeamMissing = 5 - secondTeamSize;

        return new MatchDTO(
                match.getId(),
                fieldName,
                fieldLocation,
                startTime,
                endTime,
                match.getFirstTeam(),
                match.getSecondTeam(),
                match.getFirstTeam().getLeader(),
                firstTeamMissing,
                secondTeamMissing,
                match.isConfirmed()
        );
    }

    public Match joinMatch(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getType() != MatchType.PUBLIC) {
            throw new RuntimeException("Match is not public");
        }

        if (match.getFirstTeam().getMemberEmails().contains(userEmail) ||
                match.getSecondTeam().getMemberEmails().contains(userEmail)) {
            throw new RuntimeException("You are already part of this match");
        }

        Team targetTeam;
        if (match.getFirstTeamMissing() > match.getSecondTeamMissing()) {
            targetTeam = match.getFirstTeam();
        } else if (match.getSecondTeamMissing() > match.getFirstTeamMissing()) {
            targetTeam = match.getSecondTeam();
        } else {
            targetTeam = match.getFirstTeam();
        }

        if (targetTeam.getMemberEmails().size() >= 5) {
            throw new RuntimeException("Target team is already full");
        }
        targetTeam.addPlayer(userEmail);
        if (match.getFirstTeam().getMemberEmails().size() + match.getSecondTeam().getMemberEmails().size() == 10) {
            Set<String> allMembers = new HashSet<>();
            allMembers.addAll(match.getFirstTeam().getMemberEmails());
            allMembers.addAll(match.getSecondTeam().getMemberEmails());
            match.setPendingConfirmations(allMembers);
            match.setConfirmed(false);
        }
        return matchRepository.save(match);
    }

    public boolean differents_emails(Team team1, Team team2) {
        for (String email : team1.getMemberEmails()) {
            if (team2.getMemberEmails().contains(email)) {
                return false;
            }
        }
        return true;
    }

    public Match confirmParticipation(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        if (!match.getPendingConfirmations().contains(userEmail)) {
            throw new RuntimeException("User is not pending confirmation for this match");
        }
        match.removePendingConfirmation(userEmail);
        if (match.allConfirmed()) {
            match.setConfirmed(true);
        }
        return matchRepository.save(match);
    }

    public Match leaveMatch(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getType() != MatchType.PUBLIC) {
            throw new RuntimeException("Match is not public");
        }

        boolean removed = false;
        if (match.getFirstTeam().getMemberEmails().contains(userEmail)) {
            match.getFirstTeam().removePlayer(userEmail);
            removed = true;
        } else if (match.getSecondTeam().getMemberEmails().contains(userEmail)) {
            match.getSecondTeam().removePlayer(userEmail);
            removed = true;
        }

        if (!removed) {
            throw new RuntimeException("User is not part of this match");
        }

        int totalPlayers = match.getFirstTeam().getMemberEmails().size() + match.getSecondTeam().getMemberEmails().size();
        if (totalPlayers < 10 && match.isConfirmed()) {
            match.setConfirmed(false);
            match.setPendingConfirmations(new HashSet<>());
        }

        return matchRepository.save(match);
    }
}