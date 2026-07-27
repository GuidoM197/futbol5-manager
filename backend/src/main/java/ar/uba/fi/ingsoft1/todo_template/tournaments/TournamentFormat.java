package ar.uba.fi.ingsoft1.todo_template.tournaments;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tournament format enumeration")
public enum TournamentFormat {
    @Schema(description = "Single elimination tournament format")
    SINGLE_ELIMINATION("Eliminación Directa"),
    @Schema(description = "Group stage followed by elimination format")
    GROUP_STAGE_THEN_ELIMINATION("Fase de Grupos y luego Eliminación"),
    @Schema(description = "Round robin league format")
    ROUND_ROBIN("Liga Todos contra Todos");

    private final String displayName;

    TournamentFormat(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}