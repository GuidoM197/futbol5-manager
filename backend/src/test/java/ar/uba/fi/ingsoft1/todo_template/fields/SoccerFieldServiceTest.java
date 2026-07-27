package ar.uba.fi.ingsoft1.todo_template.fields;

import ar.uba.fi.ingsoft1.todo_template.reservations.Reservation;
import ar.uba.fi.ingsoft1.todo_template.reservations.ReservationRepository;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SoccerFieldServiceTest {

    @Mock
    private SoccerFieldRepository soccerFieldRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private SoccerFieldService soccerFieldService;

    @Test
    void testCreateSoccerField_SuccessfulCreation() {
        SoccerFieldCreateDTO dto = new SoccerFieldCreateDTO(
                "Cancha 1", "Palermo", "Sintético",
                "admin@example.com", 8, 23
        );
        String ownerEmail = "owner@example.com";

        SoccerField soccerField = dto.asSoccerField(ownerEmail);

        when(userService.isAdminEmail("admin@example.com")).thenReturn(true);
        when(soccerFieldRepository.findByName("Cancha 1")).thenReturn(Optional.empty());
        when(soccerFieldRepository.save(any())).thenReturn(soccerField);

        Optional<SoccerField> result = soccerFieldService.createSoccerField(dto, ownerEmail);

        assertTrue(result.isPresent());
        assertEquals("Cancha 1", result.get().getName());
        verify(soccerFieldRepository).save(any());
    }

    @Test
    void testCreateSoccerField_InvalidAdminEmail() {
        SoccerFieldCreateDTO dto = new SoccerFieldCreateDTO(
                "Cancha 1", "Palermo", "Sintético",
                "invalid_admin@example.com", 8, 23
        );

        when(userService.isAdminEmail("invalid_admin@example.com")).thenReturn(false);

        Optional<SoccerField> result = soccerFieldService.createSoccerField(dto, "owner@example.com");

        assertTrue(result.isEmpty());
        verify(soccerFieldRepository, never()).save(any());
    }

    @Test
    void testCreateSoccerField_FieldAlreadyExists() {
        SoccerFieldCreateDTO dto = new SoccerFieldCreateDTO(
                "Cancha 1", "Palermo", "Sintético",
                "admin@example.com", 8, 23
        );
        String ownerEmail = "owner@example.com";

        when(userService.isAdminEmail("admin@example.com")).thenReturn(true);
        when(soccerFieldRepository.findByName("Cancha 1")).thenReturn(Optional.of(new SoccerField()));

        Optional<SoccerField> result = soccerFieldService.createSoccerField(dto, ownerEmail);

        assertTrue(result.isEmpty());
        verify(soccerFieldRepository, never()).save(any());
    }

    @Test
    void testDeleteFieldByOwner_SuccessfulDeletion() {
        Long fieldId = 1L;
        String ownerEmail = "owner@example.com";
        SoccerField field = new SoccerField("Cancha 1", "Buenos Aires", "Sintético",
                "admin@example.com", ownerEmail, 9, 23);
        field.setOwnerEmail(ownerEmail);

        List<Reservation> reservas = List.of(new Reservation(), new Reservation());

        when(soccerFieldRepository.findById(fieldId)).thenReturn(Optional.of(field));
        when(reservationRepository.findByField(field)).thenReturn(reservas);

        boolean result = soccerFieldService.deleteFieldByOwner(fieldId, ownerEmail);

        assertTrue(result);
        verify(reservationRepository).deleteAll(reservas);
        verify(soccerFieldRepository).delete(field);
    }

    @Test
    void testDeleteFieldByOwner_EmailMismatch() {
        Long fieldId = 1L;
        SoccerField field = new SoccerField("Cancha 2", "Córdoba", "Natural",
                "admin@example.com", "otroowner@example.com", 8, 20);

        when(soccerFieldRepository.findById(fieldId)).thenReturn(Optional.of(field));

        boolean result = soccerFieldService.deleteFieldByOwner(fieldId, "owner@example.com");

        assertFalse(result);
        verify(reservationRepository, never()).deleteAll(any());
        verify(soccerFieldRepository, never()).delete(any());
    }

    @Test
    void testDeleteFieldByOwner_FieldNotFound() {
        Long fieldId = 99L;

        when(soccerFieldRepository.findById(fieldId)).thenReturn(Optional.empty());

        boolean result = soccerFieldService.deleteFieldByOwner(fieldId, "owner@example.com");

        assertFalse(result);
        verify(reservationRepository, never()).deleteAll(any());
        verify(soccerFieldRepository, never()).delete(any());
    }

    @Test
    void testUpdateFieldByAdmin_SuccessfulUpdate() {
        Long fieldId = 1L;
        String adminEmail = "admin@example.com";

        SoccerField field = new SoccerField("Cancha 1", "Buenos Aires", "Sintético",
                adminEmail, "owner@example.com", 9, 23);
        field.setStartTime(9);
        field.setEndTime(23);

        SoccerFieldCreateDTO dto = new SoccerFieldCreateDTO(
                "Cancha Actualizada", "La Plata", "Natural",
                adminEmail, 10, 22
        );

        when(soccerFieldRepository.findById(fieldId)).thenReturn(Optional.of(field));
        when(reservationRepository.findByField(field)).thenReturn(List.of());

        Optional<SoccerField> result = soccerFieldService.updateFieldByAdmin(fieldId, dto, adminEmail);

        assertTrue(result.isPresent());
        assertEquals("Cancha Actualizada", result.get().getName());
        assertEquals("Natural", result.get().getGrassType());
        assertEquals(10, result.get().getStartTime());
        assertEquals(22, result.get().getEndTime());
    }

    @Test
    void testUpdateFieldByOwner_SuccessfulUpdate() {
        Long fieldId = 2L;

        SoccerField field = new SoccerField("Cancha Vieja", "Rosario", "Tierra",
                "admin@otro.com", "owner@example.com", 8, 20);
        field.setStartTime(8);
        field.setEndTime(20);

        SoccerFieldCreateDTO dto = new SoccerFieldCreateDTO(
                "Cancha Nueva", "Rosario Centro", "Sintético",
                "nuevoadmin@example.com", 10, 22
        );

        when(soccerFieldRepository.findById(fieldId)).thenReturn(Optional.of(field));
        when(reservationRepository.findByField(field)).thenReturn(List.of());

        Optional<SoccerField> result = soccerFieldService.updateFieldByOwner(fieldId, dto);

        assertTrue(result.isPresent());
        assertEquals("Cancha Nueva", result.get().getName());
        assertEquals("Rosario Centro", result.get().getLocation());
        assertEquals("nuevoadmin@example.com", result.get().getAdministratorEmail());
    }

    @Test
    void testSearchSoccerFieldsByUserLocation_ReturnsFields() {
        String userEmail = "user@example.com";
        String userLocation = "Downtown"; // debe coincidir con el location del usuario

        User user = new User("John", "Doe", userEmail, null, "25", "M", userLocation, "plainPassword", "USER");
        SoccerField field1 = new SoccerField("Cancha 1", userLocation, "Sintético", "admin1@example.com", "owner1@example.com", 9, 22);
        SoccerField field2 = new SoccerField("Cancha 2", userLocation, "Natural", "admin2@example.com", "owner2@example.com", 10, 23);

        Pageable pageable = PageRequest.of(0, 10);
        Page<SoccerField> expectedPage = new PageImpl<>(List.of(field1, field2));

        when(userService.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(soccerFieldRepository.findByLocation(eq(userLocation), eq(pageable))).thenReturn(expectedPage);

        Page<SoccerField> result = soccerFieldService.searchSoccerFieldsByUserLocation(userEmail, pageable);

        assertEquals(2, result.getContent().size());
        assertEquals("Cancha 1", result.getContent().get(0).getName());
        assertEquals("Cancha 2", result.getContent().get(1).getName());
    }


    @Test
    void testSearchSoccerFieldsByUserLocation_UserNotFound_ReturnsEmptyPage() {
        String email = "notfound@example.com";
        Pageable pageable = PageRequest.of(0, 10);

        when(userService.findByEmail(email)).thenReturn(Optional.empty());

        Page<SoccerField> result = soccerFieldService.searchSoccerFieldsByUserLocation(email, pageable);

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetFieldsByManager_AsAdmin_ReturnsFieldsByAdministratorEmail() {
        String adminEmail = "admin@example.com";
        List<SoccerField> fields = List.of(new SoccerField("Cancha A", "LocA", "Sintético", adminEmail, "owner@example.com", 9, 22));

        when(userService.isAdminEmail(adminEmail)).thenReturn(true);
        when(soccerFieldRepository.findByAdministratorEmail(adminEmail)).thenReturn(fields);

        List<SoccerField> result = soccerFieldService.getFieldsByManager(adminEmail);

        assertEquals(1, result.size());
        assertEquals("Cancha A", result.getFirst().getName());
    }

    @Test
    void testGetFieldsByManager_AsOwner_ReturnsFieldsByOwnerEmail() {
        String ownerEmail = "owner@example.com";
        List<SoccerField> fields = List.of(new SoccerField("Cancha B", "LocB", "Césped", "admin@example.com", ownerEmail, 8, 23));

        when(userService.isAdminEmail(ownerEmail)).thenReturn(false);
        when(soccerFieldRepository.findByOwnerEmail(ownerEmail)).thenReturn(fields);

        List<SoccerField> result = soccerFieldService.getFieldsByManager(ownerEmail);

        assertEquals(1, result.size());
        assertEquals("Cancha B", result.getFirst().getName());
    }

}