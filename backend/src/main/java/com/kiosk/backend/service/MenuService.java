package com.kiosk.backend.service;

import com.kiosk.backend.dto.MenuItemDto;
import com.kiosk.backend.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItemDto> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(MenuItemDto::new)
                .collect(Collectors.toList());
    }

    public List<MenuItemDto> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategory(category).stream()
                .map(MenuItemDto::new)
                .collect(Collectors.toList());
    }

    public List<MenuItemDto> getBestMenuItems() {
        return menuItemRepository.findByIsBestTrue().stream()
                .map(MenuItemDto::new)
                .collect(Collectors.toList());
    }
}
