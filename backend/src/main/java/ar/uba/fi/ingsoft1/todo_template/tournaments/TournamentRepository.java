package ar.uba.fi.ingsoft1.todo_template.tournaments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByOrganizerEmailOrderByCreatedAtDesc(String organizerEmail);
    List<Tournament> findByStatusOrderByStartDateAsc(TournamentStatus status);
    Optional<Tournament> findByName(String name);
    boolean existsByName(String name);
    Optional<Tournament> findByFormat(TournamentFormat format);
    Optional<Tournament> findByStatus(TournamentStatus status);
    List<Tournament> findAll();

    @Query("SELECT t FROM Tournament t WHERE " +
            "(:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:format IS NULL OR t.format = :format) AND " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:startDate IS NULL OR t.startDate = :startDate) " +
            "ORDER BY t.createdAt DESC")
    List<Tournament> searchTournaments(
            @Param("name") String name,
            @Param("format") TournamentFormat format,
            @Param("status") TournamentStatus status,
            @Param("startDate") LocalDate startDate
    );
}
