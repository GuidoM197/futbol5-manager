package ar.uba.fi.ingsoft1.todo_template.reservations;

import ar.uba.fi.ingsoft1.todo_template.fields.SoccerField;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    boolean existsByFieldAndDayAndStartHour(SoccerField field, LocalDate day, int startHour);
    List<Reservation> findByFieldAndDay(SoccerField field, LocalDate day);
    List<Reservation> findByField(SoccerField field);
    List<Reservation> findReservationByUserEmail(String userEmail);
}