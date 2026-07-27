package ar.uba.fi.ingsoft1.todo_template.fields;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SoccerFieldRepository extends JpaRepository<SoccerField, Long> {
    Optional<SoccerField> findByName(String name);
    List<SoccerField> findByAdministratorEmail(String administratorEmail);
    List<SoccerField> findByOwnerEmail(String ownerEmail);
    Page<SoccerField> findByLocation(String location, Pageable pagable);
}

