package com.kiosk.backend.repository;

import com.kiosk.backend.entity.Order;
import com.kiosk.backend.entity.OrderItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    private Order newOrder(String userType, LocalDateTime orderedAt) {
        Order order = new Order();
        order.setUserType(userType);
        order.setDineOption("dine_in");
        order.setPaymentMethod("card");
        order.setTotalAmount(5000);
        order.setDiscountAmount(0);
        order.setOrderedAt(orderedAt);

        OrderItem item = new OrderItem();
        item.setMenuName("아메리카노");
        item.setPrice(3000);
        item.setQuantity(1);
        item.setOrder(order);
        order.getItems().add(item);

        return order;
    }

    @Test
    void findByUserTypeOrderByOrderedAtDesc_returnsMatchingOrdersNewestFirst() {
        orderRepository.save(newOrder("general", LocalDateTime.now().minusDays(1)));
        orderRepository.save(newOrder("general", LocalDateTime.now()));
        orderRepository.save(newOrder("elderly", LocalDateTime.now()));

        List<Order> result = orderRepository.findByUserTypeOrderByOrderedAtDesc("general");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getOrderedAt()).isAfterOrEqualTo(result.get(1).getOrderedAt());
        assertThat(result).allMatch(o -> o.getUserType().equals("general"));
    }

    @Test
    void saveOrder_cascadesOrderItemsAndAssignsId() {
        Order saved = orderRepository.save(newOrder("general", LocalDateTime.now()));

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getItems()).hasSize(1);
        assertThat(saved.getItems().get(0).getId()).isNotNull();
    }
}
