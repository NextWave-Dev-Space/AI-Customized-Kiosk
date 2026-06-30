package com.kiosk.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDto {
    private String name;
    private String option;
    private Integer price;
    private Integer quantity;
}
