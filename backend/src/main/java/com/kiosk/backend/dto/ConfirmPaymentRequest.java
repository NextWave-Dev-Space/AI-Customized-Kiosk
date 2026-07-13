package com.kiosk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmPaymentRequest {

    @NotBlank
    private String paymentKey;

    // 토스페이먼츠에 전달한 주문 ID. "order-{Order.id}" 형식.
    @NotBlank
    private String orderId;

    @NotNull
    private Integer amount;
}
