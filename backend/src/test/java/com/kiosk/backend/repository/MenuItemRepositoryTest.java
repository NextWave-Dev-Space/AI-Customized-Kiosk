package com.kiosk.backend.repository;

import com.kiosk.backend.entity.MenuItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MenuItemRepositoryTest {

    @Autowired
    private MenuItemRepository menuItemRepository;

    private MenuItem newItem(String name, String category, boolean best) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setNameEn(name);
        item.setPrice(3000);
        item.setCategory(category);
        item.setIsBest(best);
        return item;
    }

    @Test
    void findByCategory_returnsOnlyMatchingItems() {
        menuItemRepository.save(newItem("아메리카노", "커피", false));
        menuItemRepository.save(newItem("녹차", "차", false));

        List<MenuItem> result = menuItemRepository.findByCategory("커피");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("아메리카노");
    }

    @Test
    void findByCategory_noMatch_returnsEmptyList() {
        menuItemRepository.save(newItem("아메리카노", "커피", false));

        List<MenuItem> result = menuItemRepository.findByCategory("디저트");

        assertThat(result).isEmpty();
    }

    @Test
    void findByIsBestTrue_returnsOnlyBestItems() {
        menuItemRepository.save(newItem("아메리카노", "커피", true));
        menuItemRepository.save(newItem("녹차", "차", false));

        List<MenuItem> result = menuItemRepository.findByIsBestTrue();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("아메리카노");
    }
}
