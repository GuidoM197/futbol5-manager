package ar.uba.fi.ingsoft1.todo_template.reservations;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@Tag(name = "4 - Reservations")
public class ReservationRestController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationRestController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(value = "/create", produces = "application/json")
    @Operation(summary = "Create a new reservation")
    public ResponseEntity<Reservation> createReservation(@Valid @RequestBody ReservationCreateDTO dto) {
        return reservationService.createReservation(dto)
                .map(reservation -> ResponseEntity.status(HttpStatus.CREATED).body(reservation))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }
    @PreAuthorize("hasRole('USER')")
    @GetMapping(value = "/available-hours", produces = "application/json")
    public ResponseEntity<List<Integer>> getAvailableHours(
            @RequestParam String fieldName,
            @RequestParam String day) {
        LocalDate localDate = LocalDate.parse(day);
        List<Integer> availableHours = reservationService.getAvailableHours(fieldName, localDate);
        return ResponseEntity.ok(availableHours);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping(value = "/user-reservations", produces = "application/json")
    public ResponseEntity<List<Reservation>> getUserReservations(
            @RequestParam String userEmail) {
        List<Reservation> reservations = reservationService.getUserReservations(userEmail);
        return ResponseEntity.ok(reservations);
    }
}