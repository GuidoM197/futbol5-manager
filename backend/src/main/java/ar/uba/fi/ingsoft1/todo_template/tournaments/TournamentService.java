package ar.uba.fi.ingsoft1.todo_template.tournaments;

import ar.uba.fi.ingsoft1.todo_template.teams.Team;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    @Autowired
    public TournamentService(TournamentRepository tournamentRepository, TeamRepository teamRepository) {
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
    }

    public Optional<Tournament> createTournament(TournamentCreateDTO dto, String organizerEmail) {
        if (tournamentRepository.existsByName(dto.name())) {
            return Optional.empty();
        }

        if (dto.endDate() != null && dto.endDate().isBefore(dto.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        Tournament tournament = dto.toTournament(organizerEmail);
        Tournament savedTournament = tournamentRepository.save(tournament);
        return Optional.of(savedTournament);
    }

    @Transactional(readOnly = true)
    public List<Tournament> findTournamentsByOrganizer(String organizerEmail) {
        return tournamentRepository.findByOrganizerEmailOrderByCreatedAtDesc(organizerEmail);
    }

    @Transactional(readOnly = true)
    public List<Tournament> findTournamentsByStatus(TournamentStatus status) {
        return tournamentRepository.findByStatusOrderByStartDateAsc(status);
    }

    @Transactional(readOnly = true)
    public List<Tournament> findAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Tournament> findTournamentById(Long id) {
        return tournamentRepository.findById(id);
    }

    public Optional<Tournament> updateTournament(Long id, TournamentCreateDTO dto, String organizerEmail) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(id);

        if (tournamentOpt.isEmpty()) {
            return Optional.empty();
        }

        Tournament tournament = tournamentOpt.get();

        if (!tournament.getOrganizerEmail().equals(organizerEmail)) {
            throw new IllegalArgumentException("Only the organizer can update the tournament");
        }

        if (!tournament.canBeEdited()) {
            throw new IllegalArgumentException("Tournament cannot be edited in its current state");
        }

        if (!tournament.getName().equals(dto.name()) && tournamentRepository.existsByName(dto.name())) {
            return Optional.empty();
        }

        if (dto.endDate() != null && dto.endDate().isBefore(dto.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        tournament.setName(dto.name());
        tournament.setStartDate(dto.startDate());
        tournament.setFormat(dto.format());
        tournament.setMaxTeams(dto.maxTeams());
        tournament.setEndDate(dto.endDate());
        tournament.setDescription(dto.description());
        tournament.setPrizes(dto.prizes());
        tournament.setRegistrationCost(dto.registrationCost());

        Tournament updatedTournament = tournamentRepository.save(tournament);
        return Optional.of(updatedTournament);
    }

    public boolean deleteTournament(Long id, String organizerEmail) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(id);

        if (tournamentOpt.isEmpty()) {
            return false;
        }

        Tournament tournament = tournamentOpt.get();

        if (!tournament.getOrganizerEmail().equals(organizerEmail)) {
            return false;
        }

        if (!tournament.canBeEdited()) {
            return false;
        }

        tournamentRepository.delete(tournament);
        return true;
    }

    public Optional<Tournament> updateTournamentStatus(Long id, TournamentStatus status, String organizerEmail) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(id);

        if (tournamentOpt.isEmpty()) {
            return Optional.empty();
        }

        Tournament tournament = tournamentOpt.get();

        if (!tournament.getOrganizerEmail().equals(organizerEmail)) {
            throw new IllegalArgumentException("Only the organizer can update the tournament status");
        }

        tournament.setStatus(status);
        Tournament updatedTournament = tournamentRepository.save(tournament);
        return Optional.of(updatedTournament);
    }

    @Transactional(readOnly = true)
    public List<Tournament> searchTournaments(String name, TournamentFormat format, TournamentStatus status, LocalDate startDate) {
        String searchName = (name != null && name.trim().isEmpty()) ? null : name;

        return tournamentRepository.searchTournaments(searchName, format, status, startDate);
    }

    public Tournament enrollTeam(Long tournamentId, Long teamId, String captainEmail) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getStatus() != TournamentStatus.OPEN_FOR_REGISTRATION) {
            throw new RuntimeException("Tournament is not open for registration");
        }

        if (tournament.getTeams().size() >= tournament.getMaxTeams()) {
            throw new RuntimeException("Tournament has reached the maximum number of teams");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeader().equals(captainEmail)) {
            throw new RuntimeException("Only the team captain can enroll the team");
        }

        if (tournament.getTeams().contains(team)) {
            throw new RuntimeException("Team is already enrolled in this tournament");
        }

        tournament.addTeam(team);
        return tournamentRepository.save(tournament);
    }
}