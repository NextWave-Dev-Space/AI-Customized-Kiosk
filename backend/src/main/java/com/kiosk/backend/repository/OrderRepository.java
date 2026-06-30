package com.kiosk.backend.repository;

import com.kiosk.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserTypeOrderByOrderedAtDesc(String userType);
}
