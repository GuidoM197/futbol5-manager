package ar.uba.fi.ingsoft1.todo_template.fields;

import ar.uba.fi.ingsoft1.todo_template.reservations.Reservation;
import ar.uba.fi.ingsoft1.todo_template.reservations.ReservationRepository;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SoccerFieldService {
    private final SoccerFieldRepository soccerFieldRepository;
    private final ReservationRepository reservationRepository;
    private final UserService userService;
    @Autowired
    public SoccerFieldService(SoccerFieldRepository soccerFieldRepository, UserRepository userRepository,
                              ReservationRepository reservationRepository, UserService userService) {
        this.soccerFieldRepository = soccerFieldRepository;
        this.userService = userService;
        this.reservationRepository = reservationRepository;
    }

    boolean soccerFieldExists(SoccerField soccerField) {
        return soccerFieldRepository.findByName(soccerField.getName()).isPresent();
    }

    public Optional<SoccerField> createSoccerField(SoccerFieldCreateDTO dto, String ownerEmail) {
        if (!userService.isAdminEmail(dto.administratorEmail())) {
            return Optional.empty();
        }
        SoccerField soccerField = dto.asSoccerField(ownerEmail);
        if (soccerFieldExists(soccerField)) {
            return Optional.empty();
        }

        soccerFieldRepository.save(soccerField);
        return Optional.of(soccerField);
    }

    public Page<SoccerField> searchSoccerFieldsByUserLocation(String email, Pageable pageable) {
        return userService.findByEmail(email)
                .map(user -> soccerFieldRepository.findByLocation(user.getLocation(), pageable))
                .orElse(Page.empty());
    }

    public Optional<SoccerField> findByName(@NotNull String name) {
        return soccerFieldRepository.findByName(name);
    }
    public List<SoccerField> getFieldsByManager(String managerEmail) {
        if (userService.isAdminEmail(managerEmail)) {
            return soccerFieldRepository.findByAdministratorEmail(managerEmail);
        }
        return soccerFieldRepository.findByOwnerEmail(managerEmail);
    }

    public boolean deleteFieldByOwner(Long id, String ownerEmail) {
        Optional<SoccerField> fieldOpt = soccerFieldRepository.findById(id);
        if (fieldOpt.isPresent() && fieldOpt.get().getOwnerEmail().equals(ownerEmail)) {
            SoccerField soccerField = fieldOpt.get();

            List<Reservation> reservas = reservationRepository.findByField(soccerField);
            reservationRepository.deleteAll(reservas);
            soccerFieldRepository.delete(soccerField);
            return true;
        }
        return false;
    }

    public Optional<SoccerField> updateFieldByAdmin(Long id, SoccerFieldCreateDTO dto, String adminEmail) {
        Optional<SoccerField> fieldOpt = soccerFieldRepository.findById(id);
        if (fieldOpt.isPresent() && fieldOpt.get().getAdministratorEmail().equals(adminEmail)) {
            return updateField(fieldOpt, dto, false);
        }
        return Optional.empty();
    }

    public Optional<SoccerField> updateFieldByOwner(Long id, SoccerFieldCreateDTO dto) {
        Optional<SoccerField> fieldOpt = soccerFieldRepository.findById(id);
        if (fieldOpt.isPresent()) {
            if (userService.isAdminEmail(dto.administratorEmail())) {
                return updateField(fieldOpt, dto, true);
            } else {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    private Optional<SoccerField> updateField(Optional<SoccerField> fieldOpt, SoccerFieldCreateDTO dto, Boolean isOwner) {
        SoccerField field = fieldOpt.get();

        int newStart = dto.startTime();
        int newEnd = dto.endTime();
        List<Reservation> reservations = reservationRepository.findByField(field);
        List<Reservation> reservationsToDelete = reservations.stream()
                .filter(r -> r.getStartHour() < newStart || r.getEndHour() > newEnd)
                .toList();

        reservationRepository.deleteAll(reservationsToDelete);

        field.setName(dto.name());
        field.setLocation(dto.location());
        field.setGrassType(dto.grassType());
        if(isOwner){
            field.setAdministratorEmail(dto.administratorEmail());
        }
        field.setStartTime(newStart);
        field.setEndTime(newEnd);
        soccerFieldRepository.save(field);
        return Optional.of(field);
    }
}

