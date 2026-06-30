package com.kiosk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @NotBlank
    private String userType;

    @NotBlank
    private String dineOption;

    @NotBlank
    private String paymentMethod;

    @NotEmpty
    private List<OrderItemDto> items;

    private Integer discountAmount = 0;
}
