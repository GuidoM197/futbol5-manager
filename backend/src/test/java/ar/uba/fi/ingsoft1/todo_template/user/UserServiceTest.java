package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.pictureSaver.PictureSaver;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private RefreshTokenService refreshTokenService;
    private PictureSaver pictureSaver;
    private UserService userService;

    private User mockUserWithRole(String role) {
        User user = mock(User.class);
        when(user.getRole()).thenReturn(role);
        return user;
    }

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        refreshTokenService = mock(RefreshTokenService.class);
        pictureSaver = mock(PictureSaver.class);

        userService = new UserService(jwtService, passwordEncoder, userRepository, refreshTokenService, pictureSaver);
    }

    @Test
    void createUser_shouldCreateUserAndReturnTokens() throws Exception {
        MultipartFile photo = mock(MultipartFile.class);
        String email = "test@example.com";

        UserCreateDTO dto = new UserCreateDTO(
                "John", "Doe", email,
                null, "25", "M", "Downtown",
                "plainPassword", "USER"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(pictureSaver.savePicture(photo)).thenReturn("saved/photo.jpg");
        when(jwtService.createToken(any())).thenReturn("accessToken123");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        // Prepare expected user to link to refresh token
        User expectedUser = dto.asUser(pwd -> "encodedPassword");
        expectedUser.setPhoto("saved/photo.jpg");

        RefreshToken dummyRefresh = new RefreshToken("refreshTokenXYZ", expectedUser, Instant.now().plusSeconds(3600));
        when(refreshTokenService.createFor(any(User.class))).thenReturn(dummyRefresh);

        Optional<TokenDTO> result = userService.createUser(dto, photo);

        assertTrue(result.isPresent());
        TokenDTO token = result.get();
        assertEquals("accessToken123", token.accessToken());
        assertEquals("refreshTokenXYZ", token.refreshToken());

        User savedUser = userCaptor.getValue();
        assertEquals("John", savedUser.name());
        assertEquals("Doe", savedUser.lastname());
        assertEquals("test@example.com", savedUser.getUsername());
        assertEquals("saved/photo.jpg", savedUser.getPhoto());
        assertEquals("encodedPassword", savedUser.getPassword());
    }

    @Test
    void createUser_shouldReturnEmpty_ifUserExists() throws Exception {
        UserCreateDTO dto = new UserCreateDTO(
                "Jane", "Smith", "jane@example.com",
                null, "30", "F", "ZoneX", "1234", "USER"
        );

        when(userRepository.findByEmail(dto.email())).thenReturn(Optional.of(new User()));

        Optional<TokenDTO> result = userService.createUser(dto, mock(MultipartFile.class));

        assertTrue(result.isEmpty());
        verify(userRepository, never()).save(any());
        verify(jwtService, never()).createToken(any());
    }

    @Test
    void loginUser_shouldReturnTokens_ifCredentialsAreValid() {
        String email = "user@example.com";
        String rawPassword = "password123";
        String encodedPassword = "encoded123";
        User user = new User("Name", "Last", email, "photo.jpg", "25", "M", "Zone", encodedPassword, "USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);
        when(jwtService.createToken(any())).thenReturn("accessToken456");

        RefreshToken token = new RefreshToken("refreshToken456", user, Instant.now().plusSeconds(3600));
        when(refreshTokenService.createFor(user)).thenReturn(token);

        UserCredentials credentials = new UserCredentials() {
            @Override public String email() { return email; }
            @Override public String password() { return rawPassword; }
        };

        Optional<TokenDTO> result = userService.loginUser(credentials);

        assertTrue(result.isPresent());
        TokenDTO dto = result.get();
        assertEquals("accessToken456", dto.accessToken());
        assertEquals("refreshToken456", dto.refreshToken());
    }

    @Test
    void loginUser_shouldReturnEmpty_ifUserNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        UserCredentials credentials = new UserCredentials() {
            @Override public String email() { return "notfound@example.com"; }
            @Override public String password() { return "whatever"; }
        };

        Optional<TokenDTO> result = userService.loginUser(credentials);

        assertTrue(result.isEmpty());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).createToken(any());
    }

    @Test
    void loginUser_shouldReturnEmpty_ifPasswordDoesNotMatch() {
        String email = "user@example.com";
        User user = new User("Name", "Last", email, "photo.jpg", "25", "M", "Zone", "hashedPassword", "USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        UserCredentials credentials = new UserCredentials() {
            @Override public String email() { return email; }
            @Override public String password() { return "wrongPassword"; }
        };

        Optional<TokenDTO> result = userService.loginUser(credentials);

        assertTrue(result.isEmpty());
        verify(jwtService, never()).createToken(any());
    }

    @Test
    void checkMembersRole_shouldReturnTrue_ifAllAreUsers() {
        TeamCreateDTO dto = new TeamCreateDTO("team", "leader@mail.com",
                new HashSet<>(List.of("a@mail.com", "b@mail.com")));

        User mockUser = mockUserWithRole("USER");
        when(userRepository.findByEmail("a@mail.com")).thenReturn(Optional.of(mockUser));
        User mockUserInsensitive = mockUserWithRole("user");
        when(userRepository.findByEmail("b@mail.com")).thenReturn(Optional.of(mockUserInsensitive)); // case-insensitive

        boolean result = userService.checkMembersRole(dto);

        assertTrue(result);
    }

    @Test
    void checkMembersRole_shouldReturnFalse_ifAnyHasWrongRole() {
        TeamCreateDTO dto = new TeamCreateDTO("team", "leader@mail.com",
                new HashSet<>(List.of("a@mail.com", "b@mail.com")));

        User mockUser = mockUserWithRole("USER");
        when(userRepository.findByEmail("a@mail.com")).thenReturn(Optional.of(mockUser));
        User mockAdmin = mockUserWithRole("ADMIN");
        when(userRepository.findByEmail("b@mail.com")).thenReturn(Optional.of(mockAdmin));

        boolean result = userService.checkMembersRole(dto);

        assertFalse(result);
    }


}
