package com.kiosk.backend.service;

import com.kiosk.backend.dto.CreateOrderRequest;
import com.kiosk.backend.dto.OrderResponse;
import com.kiosk.backend.entity.Order;
import com.kiosk.backend.entity.OrderItem;
import com.kiosk.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setUserType(request.getUserType());
        order.setDineOption(request.getDineOption());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setDiscountAmount(request.getDiscountAmount());

        List<OrderItem> items = request.getItems().stream().map(dto -> {
            OrderItem item = new OrderItem();
            item.setMenuName(dto.getName());
            item.setOption(dto.getOption());
            item.setPrice(dto.getPrice());
            item.setQuantity(dto.getQuantity());
            item.setOrder(order);
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);

        int total = items.stream()
                .mapToInt(i -> i.getPrice() * i.getQuantity())
                .sum();
        order.setTotalAmount(total - request.getDiscountAmount());

        Order saved = orderRepository.save(order);
        return new OrderResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다. id=" + orderId));
        return new OrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(OrderResponse::new);
    }
}
