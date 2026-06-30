package com.kiosk.backend.controller;

import com.kiosk.backend.dto.MenuItemDto;
import com.kiosk.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItemDto>> getAllMenus(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(menuService.getMenuItemsByCategory(category));
        }
        return ResponseEntity.ok(menuService.getAllMenuItems());
    }

    @GetMapping("/best")
    public ResponseEntity<List<MenuItemDto>> getBestMenus() {
        return ResponseEntity.ok(menuService.getBestMenuItems());
    }
}
