package ar.uba.fi.ingsoft1.todo_template.tournaments;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tournament status enumeration")
public enum TournamentStatus {
    @Schema(description = "Tournament is open for team registrations")
    OPEN_FOR_REGISTRATION("Abierto para Inscripción"),
    @Schema(description = "Tournament registration period has ended")
    REGISTRATION_CLOSED("Inscripciones Cerradas"),
    @Schema(description = "Tournament is currently being played")
    IN_PROGRESS("En Progreso"),
    @Schema(description = "Tournament has finished")
    COMPLETED("Completado"),
    @Schema(description = "Tournament has been cancelled")
    CANCELLED("Cancelado");

    private final String displayName;

    TournamentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 