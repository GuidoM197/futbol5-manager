package ar.uba.fi.ingsoft1.todo_template.user.dtos;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserCredentials;
import jakarta.validation.constraints.NotBlank;

import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank String name,
        @NotBlank String lastname,
        @NotBlank String email,
        String photoPath,
        @NotBlank String age,
        @NotBlank String gender,
        @NotBlank String zone,
        @NotBlank String password,
        @NotBlank String role
) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(name, lastname, email, photoPath, age ,gender, zone, encryptPassword.apply(password), role);
    }
}
