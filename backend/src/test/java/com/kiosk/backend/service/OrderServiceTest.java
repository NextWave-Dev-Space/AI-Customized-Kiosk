package com.kiosk.backend.service;

import com.kiosk.backend.dto.CreateOrderRequest;
import com.kiosk.backend.dto.OrderItemDto;
import com.kiosk.backend.dto.OrderResponse;
import com.kiosk.backend.entity.Order;
import com.kiosk.backend.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private CreateOrderRequest buildRequest(int discount) {
        OrderItemDto item1 = new OrderItemDto();
        item1.setName("아메리카노");
        item1.setOption("HOT");
        item1.setPrice(3000);
        item1.setQuantity(2);

        OrderItemDto item2 = new OrderItemDto();
        item2.setName("카페라떼");
        item2.setOption("ICE");
        item2.setPrice(4000);
        item2.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserType("general");
        request.setDineOption("dine_in");
        request.setPaymentMethod("card");
        request.setItems(List.of(item1, item2));
        request.setDiscountAmount(discount);
        return request;
    }

    @Test
    void createOrder_computesTotalAmountFromItemsMinusDiscount() {
        CreateOrderRequest request = buildRequest(1000);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        when(orderRepository.save(orderCaptor.capture())).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        OrderResponse response = orderService.createOrder(request);

        // (3000*2 + 4000*1) - 1000 = 9000
        assertThat(response.getTotalAmount()).isEqualTo(9000);
        assertThat(response.getItems()).hasSize(2);
        assertThat(orderCaptor.getValue().getUserType()).isEqualTo("general");
    }

    @Test
    void createOrder_withoutDiscount_totalEqualsItemSum() {
        CreateOrderRequest request = buildRequest(0);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(11L);
            return saved;
        });

        OrderResponse response = orderService.createOrder(request);

        assertThat(response.getTotalAmount()).isEqualTo(10000);
    }

    @Test
    void getOrder_existingId_returnsOrderResponse() {
        Order order = new Order();
        order.setId(5L);
        order.setUserType("elderly");
        order.setDineOption("take_out");
        order.setPaymentMethod("pay");
        order.setTotalAmount(5000);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrder(5L);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getUserType()).isEqualTo("elderly");
    }

    @Test
    void getOrder_nonExistingId_throwsRuntimeException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getAllOrders_returnsAllOrdersAsResponses() {
        Order order1 = new Order();
        order1.setId(1L);
        order1.setUserType("general");
        order1.setDineOption("dine_in");
        order1.setPaymentMethod("card");
        order1.setTotalAmount(1000);

        Order order2 = new Order();
        order2.setId(2L);
        order2.setUserType("children");
        order2.setDineOption("take_out");
        order2.setPaymentMethod("pay");
        order2.setTotalAmount(2000);

        Pageable pageable = PageRequest.of(0, 20);
        when(orderRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(order1, order2), pageable, 2));

        Page<OrderResponse> responses = orderService.getAllOrders(pageable);

        assertThat(responses.getContent()).hasSize(2);
        assertThat(responses.getTotalElements()).isEqualTo(2);
        assertThat(responses.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(responses.getContent().get(1).getId()).isEqualTo(2L);
    }
}
