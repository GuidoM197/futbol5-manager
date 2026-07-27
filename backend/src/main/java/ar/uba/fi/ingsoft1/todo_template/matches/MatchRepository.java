package ar.uba.fi.ingsoft1.todo_template.matches;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {
    Page<Match> findByType(MatchType type, Pageable pageable);
}