-- kiosk_db 데이터베이스 생성 (처음 한 번만 실행)
-- CREATE DATABASE IF NOT EXISTS kiosk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE kiosk_db;

-- 메뉴 초기 데이터 삽입 (테이블은 JPA가 자동 생성)
INSERT IGNORE INTO menu_items (name, name_en, price, category, img_path, description, is_best) VALUES
-- NEW
('슈슈 버거', 'Supreme Shrimp Burger', 4700, 'new', '/images/chicken_burger.png', '새콤달콤 특제소스를 듬뿍 넣은 탱글한 통새우살이 가득한 슈슈 버거', false),
('화이트갈릭버거', 'White Garlic Burger', 4900, 'new', '/images/cheese_burger.png', '부드러운 마늘 소스에 프리미엄 더블 햄과 통가슴살 패티까지 담은 묵직한 버거', false),
('할라피뇨통살버거', 'Jalapeno Thigh Burger', 4800, 'new', '/images/shrimp_jalapeno_burger.png', '바삭한 통다리살 패티와 매콤한 할라피뇨 소스가 어우러진 버거', false),
-- SINGLE
('불고기 버거', 'Bulgogi Burger', 3900, 'single', '/images/bulgogi_burger.png', '한국인의 입맛에 딱 맞는 불고기 소스에 재운 패티로 구성된 불고기 버거', true),
('더블 불고기 버거', 'Double Bulgogi Burger', 5200, 'single', '/images/shrimp_jalapeno_burger.png', '진한 불고기 소스에 재운 패티 두 장으로 구성된 깊고 풍부한 맛의 버거', false),
('치즈버거', 'Cheese Burger', 3300, 'single', '/images/bulgogi_burger.png', '고소하고 부드러운 치즈와 100% 순 쇠고기 패티로 구성된 심플한 클래식 치즈버거', false),
('콰트로 치즈버거', 'Quattro Cheese Burger', 5400, 'single', '/images/cheese_burger.png', '4가지 고급 치즈와 풍부한 육즙의 패티를 더 진하게 즐길 수 있는 버거', false),
('데리버거', 'Teri Burger', 3300, 'single', '/images/bulgogi_burger.png', '쇠고기 패티에 달콤 짭짤한 데리 소스를 더한 가성비 버거', false),
('치킨버거', 'Chicken Burger', 4000, 'single', '/images/chicken_burger.png', '닭고기 패티와 데리야끼 소스로 만든 담백하고 달콤한 맛의 치킨버거', false),
('핫크리스피 디럭스 버거', 'HotCrispy Deluxe Burger', 5900, 'single', '/images/shrimp_jalapeno_burger.png', '100% 통닭다리살 겉바속촉 케이준 치킨 패티, 촉촉한 포테이토 브리오쉬 번의 치킨 버거', false),
('토마토치즈 비프버거', 'Tomato Cheese Beef Burger', 3800, 'single', '/images/tomato_burger.png', '신선한 토마토와 매콤달콤한 소스, 고소한 치즈를 더해 풍부하고 신선한 맛의 버거', true),
-- SET
('불고기 버거 세트', 'Bulgogi Burger Set', 6200, 'set', '/images/burger_set.png', '한국인의 입맛에 딱 맞는 불고기 소스에 재운 패티로 구성된 불고기 버거 세트', false),
('더블불고기 버거세트', 'Double Bulgogi Burger Set', 7500, 'set', '/images/burger_set.png', '진한 불고기 소스에 재운 패티 두 장으로 구성된 깊고 풍부한 맛의 버거 세트', false),
('치즈버거 세트', 'Cheese Burger Set', 5500, 'set', '/images/burger_set.png', '고소하고 부드러운 치즈와 100% 순 쇠고기 패티로 구성된 심플한 클래식 치즈버거 세트', false),
('데리버거 세트', 'Teri Burger Set', 5600, 'set', '/images/burger_set.png', '쇠고기 패티에 달콤 짭짤한 데리소스를 더한 가성비 버거 세트', true),
('치킨버거 세트', 'Chicken Burger Set', 6300, 'set', '/images/burger_set.png', '닭고기 패티와 데리야끼 소스로 만든 담백하고 달콤한 맛의 치킨버거 세트', false),
('핫크리스피 디럭스 버거세트', 'HotCrispy Deluxe Burger Set', 7800, 'set', '/images/burger_set.png', '100% 통닭다리살 겉바속촉 케이준 치킨 패티의 치킨 버거 세트', true),
('토마토치즈비프 버거 세트', 'Tomato Cheese Beef Burger Set', 5600, 'set', '/images/burger_set.png', '신선한 토마토와 매콤달콤한 소스, 고소한 치즈를 더해 풍부하고 신선한 맛의 버거 세트', false),
-- DRINK
('코카콜라', 'Cola', 2000, 'drink', '/images/coke.png', '톡 쏘는 시원함과 상쾌함이 느껴지는 음료', true),
('사이다', 'Sprite', 2000, 'drink', '/images/soda.png', '톡 쏘는 시원함과 상쾌함이 느껴지는 음료', false),
('아메리카노', 'Americano', 2600, 'drink', '/images/coffee.png', '아라비카 원두 100%를 함유한 부드러운 커피', false),
('오렌지 주스', 'Orange Juice', 2500, 'drink', '/images/orange_juice.png', '비타민 C를 100% 함유한 오렌지 주스', false),
('생수', 'Water', 1000, 'drink', '/images/water.png', '활력을 되찾아주는 깔끔한 생수', false),
-- SIDE
('치킨너겟', 'Chicken Nugget', 2700, 'side', '/images/nuggets.png', '닭안심살과 닭가슴살로 만든 담백하고 촉촉한 치킨너겟 (5조각+소스)', false),
('후렌치 후라이', 'French Fries', 2200, 'side', '/images/frenchfries.png', '통으로 썰어낸 감자를 튀겨낸 바삭한 감자튀김', true),
('골든 모짜렐라 치즈스틱', 'Golden Mozzarella Cheese Sticks', 2400, 'side', '/images/cheese_stick.png', '통 모짜렐라 치즈에 튀김옷을 입혀 만든 바삭하고 고소한 치즈스틱 (2조각)', false),
('바닐라 아이스크림콘', 'Vanilla Ice Cream Cone', 1300, 'side', '/images/ice_cream.png', '신선한 우유로 만든 부드러운 아이스크림콘', true),
('코울슬로', 'Coleslaw', 1900, 'side', '/images/coleslaw.png', '양배추, 당근, 양파가 상큼하고 부드러운 마요네즈 드레싱과 어우러진 샐러드', false),
('사이드소스', 'Sauce', 500, 'side', '/images/source.png', '치킨너겟, 감자튀김을 더 맛있게 먹고 싶을 때 도움이 되는 소스 (칠리맛)', false);
