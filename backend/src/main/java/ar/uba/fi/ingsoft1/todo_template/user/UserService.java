package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.teams.TeamCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.RefreshDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dtos.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.pictureSaver.PictureSaver;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final PictureSaver pictureSaver;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService, PictureSaver pictureSaver
    ) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.pictureSaver = pictureSaver;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
                .findByEmail(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
    }

    Optional<TokenDTO> createUser(UserCreateDTO data, MultipartFile photo) throws IOException {
        if (userRepository.findByEmail(data.email()).isPresent()) {
            return Optional.empty();
        } else {
            var user = data.asUser(passwordEncoder::encode);
            if (!photo.isEmpty()) {
                var path = pictureSaver.savePicture(photo);
                user.setPhoto(path);
            } else {
                user.setPhoto("/user.jpg");
            }
            userRepository.save(user);
            return Optional.of(generateTokens(user));
        }
    }

    Optional<TokenDTO> loginUser(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByEmail(data.email());
        return maybeUser
                .filter(user -> passwordEncoder.matches(data.password(), user.getPassword()))
                .map(this::generateTokens);
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getUsername(),
                user.getRole()
        ));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value());
    }

    public Optional<byte[]> getUserPictureByEmail(String email) {
        return userRepository.findByEmail(email).flatMap(user -> {
            try {
                String path = user.getPhoto();
                if (path == null) {
                    return Optional.empty();
                }

                byte[] picture = pictureSaver.getPicture(path);
                return Optional.ofNullable(picture);
            } catch (RuntimeException e) {
                return Optional.empty();
            }
        });
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean isAdminEmail(String email) {
        return userRepository.existsByEmailAndRole(email, "ADMIN");
    }

    public boolean checkMembersRole(@Valid TeamCreateDTO dto) {
        for (String email : dto.memberEmails()) {
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !"USER".equalsIgnoreCase(userOpt.get().getRole())) {
                return false;
            }
        }
        return true;
    }
    public boolean checkMembersLocation(@Valid TeamCreateDTO dto) {
        var leaderOpt = userRepository.findByEmail(dto.leader());
        if (leaderOpt.isEmpty()) {
            return false;
        }
        String leaderLocation = leaderOpt.get().getLocation();
        for (String email : dto.memberEmails()) {
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || !userOpt.get().getLocation().equals(leaderLocation)) {
                return false;
            }
        }
        return true;
    }
    public void save(User user) {
        userRepository.save(user);
    }
}
