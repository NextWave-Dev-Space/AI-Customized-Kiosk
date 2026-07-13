package com.kiosk.backend.service;

/** 토스페이먼츠 결제 승인 실패, 또는 금액 위변조 등 결제 검증 실패 시 던져짐. */
public class PaymentException extends RuntimeException {
    public PaymentException(String message) {
        super(message);
    }
}
