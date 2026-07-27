package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity(name = "users")
public class User implements UserDetails, UserCredentials {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String photoPath;

    @Column(nullable = false)
    private String age;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String zone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    public User(String name, String lastname, String email, String photo, String age, String gender, String zone, String password, String role) {
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.photoPath = photo;
        this.age = age;
        this.gender = gender;
        this.zone = zone;
        this.password = password;
        this.role = role;
    }

    public User() {

    }

    public String name() {
        return this.name;
    }

    public String lastname() {
        return this.lastname;
    }

    @Override
    public String email() {
        return this.email;
    }

    public String photo() {
        return this.photoPath;
    }

    public String age() {
        return this.age;
    }

    public String gender() {
        return this.gender;
    }

    public String getLocation() {
        return this.zone;
    }

    @Override
    public String password() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    public String getRole() {
        return role;
    }

    public String getPhoto() {
        return this.photoPath;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    public void setPhoto(String path) {this.photoPath = path;}

    public void setName(String name) {this.name = name;}

    public void setLastname(String lastname) {this.lastname = lastname;}

    public void setAge(String age) {this.age = age;}

    public void setGender(String gender) {this.gender = gender;}

    public void setLocation(String zone) {this.zone = zone;}
}
