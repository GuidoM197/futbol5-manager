package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.user.dtos.ProfileDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.UpdateProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@Tag(name = "1 - Users")
class UserRestController {
    private final UserService userService;

    @Autowired
    UserRestController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Returns the authenticated user's picture")
    @ApiResponse(responseCode = "200", description = "User picture returned", content = {
            @Content(mediaType = "image/jpeg")
    })
    @ApiResponse(responseCode = "404", description = "Picture not found", content = @Content)
    @GetMapping(value = "/picture", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getUserPicture(@AuthenticationPrincipal(expression = "username") String email) {
        try {
            Optional<byte[]> pictureData = userService.getUserPictureByEmail(email);
            return pictureData
                    .map(data -> ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .body(data))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Returns the authenticated user's profile")
    @ApiResponse(responseCode = "200", description = "User profile returned")
    @ApiResponse(responseCode = "404", description = "User not found")
    @GetMapping(value = "/me")
    public ResponseEntity<ProfileDTO> getMyProfile(@AuthenticationPrincipal(expression = "username") String email) {
        try {
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            User user = userOpt.get();
            return ResponseEntity.ok(new ProfileDTO(user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Returns the user's email")
    @ApiResponse(responseCode = "200", description = "User email returned")
    @ApiResponse(responseCode = "404", description = "User email not found")
    @GetMapping(value = "/get-email")
    public ResponseEntity<String> getUserEmail(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        try {
            Optional<User> userOpt = userService.findByEmail(email);
            return userOpt.map(user -> ResponseEntity.ok(user.email())).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Updates the authenticated user's profile")
    @ApiResponse(responseCode = "200", description = "User profile updated")
    @ApiResponse(responseCode = "404", description = "User not found")
    @PutMapping("/me/update")
    public ResponseEntity<ProfileDTO> updateMyProfile(
            @AuthenticationPrincipal(expression = "username") String email,
            @RequestBody UpdateProfileDTO dto
    ) {
        try {
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            User user = userOpt.get();
            user.setName(dto.name);
            user.setLastname(dto.lastname);
            user.setAge(dto.age);
            user.setGender(dto.gender);
            user.setLocation(dto.zone);

            userService.save(user);

            return ResponseEntity.ok(new ProfileDTO(user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}
