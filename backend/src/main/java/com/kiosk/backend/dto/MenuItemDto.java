package com.kiosk.backend.dto;

import com.kiosk.backend.entity.MenuItem;
import lombok.Getter;

@Getter
public class MenuItemDto {

    private final Long id;
    private final String name;
    private final String nameEn;
    private final Integer price;
    private final String category;
    private final String imgPath;
    private final String description;
    private final Boolean isBest;

    public MenuItemDto(MenuItem item) {
        this.id = item.getId();
        this.name = item.getName();
        this.nameEn = item.getNameEn();
        this.price = item.getPrice();
        this.category = item.getCategory();
        this.imgPath = item.getImgPath();
        this.description = item.getDescription();
        this.isBest = item.getIsBest();
    }
}
