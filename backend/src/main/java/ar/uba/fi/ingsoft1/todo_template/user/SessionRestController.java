package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.user.dtos.RefreshDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.UserLoginDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/sessions")
@Tag(name = "2 - Sessions")
class SessionRestController {

    private final UserService userService;
    @Autowired
    SessionRestController(UserService userService, @Value("${app.base-url}") String baseUrl) {
        this.userService = userService;
    }

    @PostMapping(produces = "application/json", value = "/signup/user", consumes = "multipart/form-data")
    @Operation(summary = "Create a new user")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content)
    public ResponseEntity<TokenDTO> signUp(
            @RequestPart("photo") @Valid @NonNull MultipartFile photo,
            @RequestPart("data") @Valid @NonNull UserCreateDTO data
    ) throws IOException {
        return userService.createUser(data, photo)
                .map(tk -> ResponseEntity.status(HttpStatus.CREATED).body(tk))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }


    @PostMapping(produces = "application/json", value = "/login/user")
    @Operation(summary = "Log in, creating a new session")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "401", description = "Invalid username or password supplied", content = @Content)
    public TokenDTO login(
            @Valid @NonNull @RequestBody UserLoginDTO data
    ) throws MethodArgumentNotValidException {
        return userService
                .loginUser(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PutMapping(produces = "application/json")
    @Operation(summary = "Refresh a session")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "401", description = "Invalid refresh token supplied", content = @Content)
    public TokenDTO refresh(
            @Valid @NonNull @RequestBody RefreshDTO data
    ) throws MethodArgumentNotValidException {
        return userService
                .refresh(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}