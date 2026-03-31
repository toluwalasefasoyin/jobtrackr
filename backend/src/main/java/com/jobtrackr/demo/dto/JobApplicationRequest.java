package com.jobtrackr.demo.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class JobApplicationRequest {
    private String company;
    private String role;
    private String status;
    private LocalDate dateApplied;
    private String notes;
    private String jobLink;
}