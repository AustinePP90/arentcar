package com.apple.arentcar.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class BranchsSearchDTO {
    private Integer branchCode;
    private String branchName;
    private String branchLongitude;
    private String branchLatitude;
    private Integer regionCode;
    private String regionName;
    private String postCode;
    private String branchBasicAddress;
    private String branchDetailedAddress;
    private String branchPhoneNumber;
    private String availablePickupTime;
    private String availableReturnTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}