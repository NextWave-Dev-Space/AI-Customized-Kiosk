package com.kiosk.backend.controller;

import com.kiosk.backend.entity.MenuItem;
import com.kiosk.backend.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MenuControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();

        MenuItem americano = new MenuItem();
        americano.setName("아메리카노");
        americano.setNameEn("Americano");
        americano.setPrice(3000);
        americano.setCategory("커피");
        americano.setIsBest(true);
        menuItemRepository.save(americano);

        MenuItem greenTea = new MenuItem();
        greenTea.setName("녹차");
        greenTea.setNameEn("Green Tea");
        greenTea.setPrice(3500);
        greenTea.setCategory("차");
        greenTea.setIsBest(false);
        menuItemRepository.save(greenTea);
    }

    @Test
    void getAllMenus_withoutCategory_returnsAllItems() throws Exception {
        mockMvc.perform(get("/api/menus"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllMenus_withCategory_returnsFilteredItems() throws Exception {
        mockMvc.perform(get("/api/menus").param("category", "커피"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("아메리카노"));
    }

    @Test
    void getBestMenus_returnsOnlyBestItems() throws Exception {
        mockMvc.perform(get("/api/menus/best"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].isBest").value(true));
    }
}
