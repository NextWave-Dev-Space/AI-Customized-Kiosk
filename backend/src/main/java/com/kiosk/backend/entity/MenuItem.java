package com.kiosk.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private String category;

    private String imgPath;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean isBest = false;
}
