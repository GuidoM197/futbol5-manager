package ar.uba.fi.ingsoft1.todo_template.teams;

import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserService userService;
    private static final int MAX_MEMBERS_PER_TEAM = 5;

    @Autowired
    TeamService(TeamRepository teamRepository, UserService userService) {
        this.teamRepository = teamRepository;
        this.userService = userService;
    }

    public Optional<Team> createTeam(@Valid TeamCreateDTO dto) {
        String finalName = (dto.name() == null || dto.name().isEmpty())
                ? "Team-" + UUID.randomUUID()
                : dto.name();

        String userEmail = (dto.leader() == null || dto.leader().isEmpty())
                ? "leader-" + UUID.randomUUID()
                : dto.leader();

        if (!finalName.startsWith("Team-")) {
            if (teamRepository.existsByTeamName(finalName)) {
                return Optional.empty();
            }
        }
        if (!userService.checkMembersRole(dto)) {
            return Optional.empty();
        }
        System.out.println("name: " + finalName);
        Team team = new Team(finalName, userEmail, new HashSet<>(dto.memberEmails()));
        teamRepository.save(team);
        return Optional.of(team);
    }

    public List<Team> findTeamsByMemberEmail(String email) {
        return teamRepository.findAll().stream()
                .filter(team -> team.getMemberEmails() != null && team.getMemberEmails().contains(email))
                .toList();
    }

    public List<Team> findTeamsByLeaderEmail(String email) {
        return teamRepository.findByLeader(email);
    }

    public boolean deleteTeamByLeader(Long teamId, String leaderEmail) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isPresent() && teamOpt.get().getLeader().equals(leaderEmail)) {
            teamRepository.deleteById(teamId);
            return true;
        }
        return false;
    }

    public Optional<Team> updateTeamByLeader(Long teamId, TeamCreateDTO dto, String leaderEmail) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isPresent() && teamOpt.get().getLeader().equals(leaderEmail)) {
            Team team = teamOpt.get();

            if (!userService.checkMembersRole(dto)) return Optional.empty();
            if (!userService.checkMembersLocation(dto)) return Optional.empty();

            HashSet<String> members = new HashSet<>(dto.memberEmails());
            if (members.size() != MAX_MEMBERS_PER_TEAM) {
                return Optional.empty();
            }

            team.setMemberEmails(members);
            team.setLeader(dto.leader());
            teamRepository.save(team);
            return Optional.of(team);
        }
        return Optional.empty();
    }

    public Optional<Team> findTeamByMembers(@NotNull HashSet<String> members) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getMemberEmails().containsAll(members))
                .findFirst();
    }

}
