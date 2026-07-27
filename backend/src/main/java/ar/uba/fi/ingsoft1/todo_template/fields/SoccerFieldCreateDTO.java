package ar.uba.fi.ingsoft1.todo_template.fields;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record SoccerFieldCreateDTO(
        @NotBlank String name,
        @NotBlank String location,
        @NotBlank String grassType,
        @NotBlank String administratorEmail,
        @DecimalMin("00") @DecimalMax("23") Integer startTime,
        @DecimalMin("01") @DecimalMax("24") Integer endTime
) {
    public SoccerField asSoccerField(String ownerEmail) {
        return new SoccerField(name, location, grassType, administratorEmail, ownerEmail, startTime, endTime);
    }
}
