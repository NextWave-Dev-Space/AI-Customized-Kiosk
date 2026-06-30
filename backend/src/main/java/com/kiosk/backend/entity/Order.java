package com.kiosk.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userType;   // "general" | "elderly" | "children"

    @Column(nullable = false)
    private String dineOption; // "dine_in" | "take_out"

    @Column(nullable = false)
    private String paymentMethod; // "card" | "pay"

    @Column(nullable = false)
    private Integer totalAmount;

    private Integer discountAmount = 0;

    @Column(nullable = false)
    private String status = "COMPLETED";

    @Column(nullable = false)
    private LocalDateTime orderedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
