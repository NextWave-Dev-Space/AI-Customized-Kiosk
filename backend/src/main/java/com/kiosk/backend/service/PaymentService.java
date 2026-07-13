package com.kiosk.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiosk.backend.dto.ConfirmPaymentRequest;
import com.kiosk.backend.dto.OrderResponse;
import com.kiosk.backend.entity.Order;
import com.kiosk.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    @Transactional
    public OrderResponse confirmPayment(ConfirmPaymentRequest request) {
        Long orderId = extractOrderId(request.getOrderId());
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new PaymentException("주문을 찾을 수 없습니다. orderId=" + orderId));

        // 클라이언트가 보낸 금액이 서버에 저장된 실제 주문 금액과 다르면 위변조로 간주하고 거부한다.
        if (!order.getTotalAmount().equals(request.getAmount())) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            throw new PaymentException("결제 금액이 주문 금액과 일치하지 않습니다.");
        }

        try {
            requestTossConfirm(request);
        } catch (HttpStatusCodeException e) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            throw new PaymentException(extractTossErrorMessage(e));
        }

        order.setStatus("DONE");
        Order saved = orderRepository.save(order);
        return new OrderResponse(saved);
    }

    private void requestTossConfirm(ConfirmPaymentRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + encodeSecretKey());

        Map<String, Object> body = Map.of(
                "paymentKey", request.getPaymentKey(),
                "orderId", request.getOrderId(),
                "amount", request.getAmount()
        );

        restTemplate.exchange(
                TOSS_CONFIRM_URL,
                org.springframework.http.HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class
        );
    }

    private String encodeSecretKey() {
        return Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));
    }

    private Long extractOrderId(String tossOrderId) {
        try {
            return Long.parseLong(tossOrderId.replace("order-", ""));
        } catch (NumberFormatException e) {
            throw new PaymentException("유효하지 않은 orderId 형식입니다: " + tossOrderId);
        }
    }

    private String extractTossErrorMessage(HttpStatusCodeException e) {
        try {
            JsonNode node = objectMapper.readTree(e.getResponseBodyAsString());
            if (node.has("message")) {
                return node.get("message").asText();
            }
        } catch (Exception ignored) {
            // 응답 파싱 실패 시 기본 메시지로 폴백
        }
        return "결제 승인에 실패했습니다. (" + e.getStatusCode() + ")";
    }
}
