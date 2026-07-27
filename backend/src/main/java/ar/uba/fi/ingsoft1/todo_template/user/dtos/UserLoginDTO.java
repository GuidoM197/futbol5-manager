package ar.uba.fi.ingsoft1.todo_template.user.dtos;

import ar.uba.fi.ingsoft1.todo_template.user.UserCredentials;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login credentials for user authentication")
public record UserLoginDTO(
        @Schema(description = "User's email address", example = "user@example.com")
        @NotBlank String email,
        
        @Schema(description = "User's password", example = "password123")
        @NotBlank String password
) implements UserCredentials {}
