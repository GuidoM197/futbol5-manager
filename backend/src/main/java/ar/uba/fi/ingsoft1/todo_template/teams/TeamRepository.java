package ar.uba.fi.ingsoft1.todo_template.teams;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.HashSet;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    boolean existsByTeamName(String teamName);
    List<Team> findByLeader(String leaderEmail);
}
