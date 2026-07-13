package com.kiosk.backend.service;

import com.kiosk.backend.dto.MenuItemDto;
import com.kiosk.backend.entity.MenuItem;
import com.kiosk.backend.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @InjectMocks
    private MenuService menuService;

    private MenuItem coffee;
    private MenuItem tea;

    @BeforeEach
    void setUp() {
        coffee = new MenuItem();
        coffee.setId(1L);
        coffee.setName("아메리카노");
        coffee.setNameEn("Americano");
        coffee.setPrice(3000);
        coffee.setCategory("커피");
        coffee.setIsBest(true);

        tea = new MenuItem();
        tea.setId(2L);
        tea.setName("녹차");
        tea.setNameEn("Green Tea");
        tea.setPrice(3500);
        tea.setCategory("차");
        tea.setIsBest(false);
    }

    @Test
    void getAllMenuItems_returnsAllItemsAsDto() {
        when(menuItemRepository.findAll()).thenReturn(List.of(coffee, tea));

        List<MenuItemDto> result = menuService.getAllMenuItems();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("아메리카노");
        assertThat(result.get(1).getName()).isEqualTo("녹차");
    }

    @Test
    void getAllMenuItems_emptyRepository_returnsEmptyList() {
        when(menuItemRepository.findAll()).thenReturn(List.of());

        List<MenuItemDto> result = menuService.getAllMenuItems();

        assertThat(result).isEmpty();
    }

    @Test
    void getMenuItemsByCategory_filtersRepositoryByCategory() {
        when(menuItemRepository.findByCategory("커피")).thenReturn(List.of(coffee));

        List<MenuItemDto> result = menuService.getMenuItemsByCategory("커피");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("커피");
        verify(menuItemRepository).findByCategory("커피");
    }

    @Test
    void getBestMenuItems_returnsOnlyBestItems() {
        when(menuItemRepository.findByIsBestTrue()).thenReturn(List.of(coffee));

        List<MenuItemDto> result = menuService.getBestMenuItems();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsBest()).isTrue();
    }
}
