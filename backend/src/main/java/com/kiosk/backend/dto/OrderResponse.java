package com.kiosk.backend.dto;

import com.kiosk.backend.entity.Order;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class OrderResponse {

    private final Long id;
    private final String userType;
    private final String dineOption;
    private final String paymentMethod;
    private final Integer totalAmount;
    private final Integer discountAmount;
    private final String status;
    private final LocalDateTime orderedAt;
    private final List<OrderItemDto> items;

    public OrderResponse(Order order) {
        this.id = order.getId();
        this.userType = order.getUserType();
        this.dineOption = order.getDineOption();
        this.paymentMethod = order.getPaymentMethod();
        this.totalAmount = order.getTotalAmount();
        this.discountAmount = order.getDiscountAmount();
        this.status = order.getStatus();
        this.orderedAt = order.getOrderedAt();
        this.items = order.getItems().stream().map(item -> {
            OrderItemDto dto = new OrderItemDto();
            dto.setName(item.getMenuName());
            dto.setOption(item.getOption());
            dto.setPrice(item.getPrice());
            dto.setQuantity(item.getQuantity());
            return dto;
        }).collect(Collectors.toList());
    }
}
