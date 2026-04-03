package com.jobtrackr.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String company;

    @NotBlank
    private String role;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDate dateApplied;

    private LocalDate interviewDate;

    private String notes;

    private String jobLink;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "email", "hibernateLazyInitializer", "handler"})
    private User user;

    public enum Status {
        APPLIED,
        INTERVIEW,
        OFFER,
        REJECTED
    }
}