package com.jobtrackr.demo.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @Column(nullable = true)
    private String phone;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String bio;

    // Notification preferences
    @Column(nullable = true)
    private Boolean emailOnNewJob = true;

    @Column(nullable = true)
    private Boolean emailOnUpdate = true;

    @Column(nullable = true)
    private Boolean emailOnOffer = true;

    @Column(nullable = true)
    private Boolean pushNotifications = true;
}