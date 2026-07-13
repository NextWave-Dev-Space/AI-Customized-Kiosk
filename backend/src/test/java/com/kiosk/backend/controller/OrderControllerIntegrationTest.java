package com.kiosk.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiosk.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    private Map<String, Object> validOrderPayload() {
        return Map.of(
                "userType", "general",
                "dineOption", "dine_in",
                "paymentMethod", "card",
                "discountAmount", 500,
                "items", java.util.List.of(
                        Map.of("name", "아메리카노", "option", "HOT", "price", 3000, "quantity", 2)
                )
        );
    }

    @Test
    void createOrder_validRequest_returnsCreatedOrderWithComputedTotal() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOrderPayload())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.totalAmount").value(5500)) // 3000*2 - 500
                .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void createOrder_missingRequiredField_returnsBadRequest() throws Exception {
        Map<String, Object> invalidPayload = Map.of(
                "dineOption", "dine_in",
                "paymentMethod", "card",
                "items", java.util.List.of(
                        Map.of("name", "아메리카노", "price", 3000, "quantity", 1)
                )
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createOrder_emptyItems_returnsBadRequest() throws Exception {
        Map<String, Object> invalidPayload = Map.of(
                "userType", "general",
                "dineOption", "dine_in",
                "paymentMethod", "card",
                "items", java.util.List.of()
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOrder_existingId_returnsOrder() throws Exception {
        String response = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOrderPayload())))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/orders/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void getOrder_nonExistingId_returnsServerError() throws Exception {
        mockMvc.perform(get("/api/orders/999999"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void getAllOrders_returnsAllCreatedOrders() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validOrderPayload())));
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validOrderPayload())));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
