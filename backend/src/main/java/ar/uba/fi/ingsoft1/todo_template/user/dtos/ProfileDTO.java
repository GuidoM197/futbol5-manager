package ar.uba.fi.ingsoft1.todo_template.user.dtos;

import ar.uba.fi.ingsoft1.todo_template.user.User;

public class ProfileDTO {
    public String name;
    public String lastname;
    public String email;
    public String age;
    public String gender;
    public String zone;
    public String role;

    public ProfileDTO(User user) {
        this.name = user.name();
        this.lastname = user.lastname();
        this.email = user.email();
        this.age = user.age();
        this.gender = user.gender();
        this.zone = user.getLocation();
        this.role = user.getRole();
    }
}