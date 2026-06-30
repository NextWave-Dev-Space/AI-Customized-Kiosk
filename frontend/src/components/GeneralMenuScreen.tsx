'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { MenuItem, OrderItem } from '@/types';
import './GeneralMenuScreen.css';

const menuData: Record<string, MenuItem[]> = {
  new: [
    { name: '슈슈 버거\nSupreme Shrimp Burger', price: 4700, img: '/images/chicken_burger.png', description: '새콤달콤 특제소스를 듬뿍 넣은 탱글한<br />통새우살이 가득한<br />슈슈 버거' },
    { name: '화이트갈릭버거\nWhite Garlic Burger', price: 4900, img: '/images/cheese_burger.png', description: '부드러운 마늘 소스에 프리미엄 더블 햄과<br />통가슴살 패티까지<br />담은 묵직한 버거' },
    { name: '할라피뇨통살버거\nJalapeno Thigh Burger', price: 4800, img: '/images/shrimp_jalapeno_burger.png', description: '바삭한 통다리살<br />패티와 매콤한<br />할라피뇨 소스가 어우러진 버거' },
  ],
  single: [
    { name: '불고기 버거\nBulgogi Burger', price: 3900, img: '/images/bulgogi_burger.png', description: '한국인의 입맛에 딱 맞는 불고기 소스에 재운 패티', best: true },
    { name: '더블 불고기 버거\nDouble Bulgogi Burger', price: 5200, img: '/images/shrimp_jalapeno_burger.png', description: '진한 불고기 소스에 재운 패티 두 장' },
    { name: '치즈버거\nCheese Burger', price: 3300, img: '/images/bulgogi_burger.png', description: '고소하고 부드러운 치즈와 100% 순 쇠고기 패티' },
    { name: '콰트로 치즈버거\nQuattro Cheese Burger', price: 5400, img: '/images/cheese_burger.png', description: '4가지 고급 치즈와 풍부한 육즙의 패티' },
    { name: '데리버거\nTeri Burger', price: 3300, img: '/images/bulgogi_burger.png', description: '쇠고기 패티에 달콤짭짤한 데리 소스' },
    { name: '치킨버거\nChicken Burger', price: 4000, img: '/images/chicken_burger.png', description: '닭고기 패티와 데리야끼 소스로 만든 담백한 치킨버거' },
    { name: '핫크리스피 디럭스 버거\nHotCrispy Deluxe Burger', price: 5900, img: '/images/shrimp_jalapeno_burger.png', description: '100% 통닭다리살 겉바속촉 케이준 치킨 패티' },
    { name: '토마토치즈 비프버거\nTomato Cheese Beef Burger', price: 3800, img: '/images/tomato_burger.png', description: '신선한 토마토와 매콤달콤한 소스, 고소한 치즈', best: true },
  ],
  set: [
    { name: '불고기 버거 세트\nBulgogi Burger Set', price: 6200, img: '/images/burger_set.png', description: '불고기 버거 세트' },
    { name: '더블불고기 버거세트\nDouble Bulgogi Burger Set', price: 7500, img: '/images/burger_set.png', description: '더블 불고기 버거 세트' },
    { name: '치즈버거 세트\nCheese Burger Set', price: 5500, img: '/images/burger_set.png', description: '치즈버거 세트' },
    { name: '데리버거 세트\nTeri Burger Set', price: 5600, img: '/images/burger_set.png', description: '데리버거 세트', best: true },
    { name: '치킨버거 세트\nChicken Burger Set', price: 6300, img: '/images/burger_set.png', description: '치킨버거 세트' },
    { name: '핫크리스피 디럭스 버거세트\nHotCrispy Deluxe Burger Set', price: 7800, img: '/images/burger_set.png', description: '핫크리스피 버거 세트', best: true },
    { name: '토마토치즈비프 버거 세트\nTomato Cheese Beef Burger Set', price: 5600, img: '/images/burger_set.png', description: '토마토치즈비프 버거 세트' },
  ],
  drink: [
    { name: '코카콜라\nCola', price: 2000, img: '/images/coke.png', description: '톡 쏘는 시원함과 상쾌함', best: true },
    { name: '사이다\nSprite', price: 2000, img: '/images/soda.png', description: '톡 쏘는 시원함' },
    { name: '아메리카노\nAmericano', price: 2600, img: '/images/coffee.png', description: '아라비카 원두 100% 부드러운 커피' },
    { name: '오렌지 주스\nOrange Juice', price: 2500, img: '/images/orange_juice.png', description: '비타민 C를 100% 함유한 오렌지 주스' },
    { name: '생수\nWater', price: 1000, img: '/images/water.png', description: '활력을 되찾아주는 깔끔한 생수' },
  ],
  side: [
    { name: '치킨너겟\nChicken Nugget', price: 2700, img: '/images/nuggets.png', description: '닭안심살과 닭가슴살로 만든 치킨너겟 (5조각+소스)' },
    { name: '후렌치 후라이\nFrench Fries', price: 2200, img: '/images/frenchfries.png', description: '통으로 썰어낸 감자를 튀겨낸 감자튀김', best: true },
    { name: '골든 모짜렐라 치즈스틱\nGolden Mozzarella Cheese Sticks', price: 2400, img: '/images/cheese_stick.png', description: '바삭하고 고소한 치즈스틱 (2조각)' },
    { name: '바닐라 아이스크림콘\nVanilla Ice Cream Cone', price: 1300, img: '/images/ice_cream.png', description: '신선한 우유로 만든 아이스크림콘', best: true },
    { name: '코울슬로\nColeslaw', price: 1900, img: '/images/coleslaw.png', description: '양배추, 당근, 양파가 마요네즈 드레싱과 어우러진 샐러드' },
    { name: '사이드소스\nSauce', price: 500, img: '/images/source.png', description: '치킨너겟, 감자튀김용 소스 (칠리맛)' },
  ],
};

const recommendedMenus: MenuItem[] = [
  { name: '골든 모짜렐라\n치즈스틱', price: 2400, img: '/images/cheese_stick.png', description: '' },
  { name: '바닐라\n아이스크림콘', price: 1300, img: '/images/ice_cream.png', description: '' },
  { name: '코울슬로', price: 1900, img: '/images/coleslaw.png', description: '' },
];

const categoryMapping: Record<string, string> = {
  NEW: 'new', SINGLE: 'single', SET: 'set', DRINK: 'drink', SIDE: 'side',
};

const itemsPerPage = 11;

const GeneralMenuScreen = () => {
  const router = useRouter();
  const { addItem } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('new');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [popupItem, setPopupItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [popupPrice, setPopupPrice] = useState(0);
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);
  const [isBackgroundDimmed, setIsBackgroundDimmed] = useState(false);
  const [isRecommendationPopupVisible, setIsRecommendationPopupVisible] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([]);

  const currentItems = menuData[selectedCategory].slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleItemClick = (item: MenuItem) => {
    setPopupItem(item);
    setQuantity(1);
    setSelectedOption(null);
    setPopupPrice(item.price);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    if (popupItem) {
      if (popupItem.name.includes('코카콜라') || popupItem.name.includes('사이다')) {
        setPopupPrice(option === 'L' ? 2200 : 2000);
      } else {
        setPopupPrice(popupItem.price);
      }
    }
  };

  const handleAddToOrder = () => {
    if (!popupItem) return;
    if (!selectedOption && (popupItem.name.includes('코카콜라') || popupItem.name.includes('사이다') || popupItem.name.includes('아메리카노'))) {
      alert('옵션을 선택해주세요.');
      return;
    }
    const itemToAdd: OrderItem = { name: popupItem.name, option: selectedOption ?? undefined, price: popupPrice, quantity };
    const idx = selectedItems.findIndex((i) => i.name === itemToAdd.name && i.option === itemToAdd.option);
    if (idx !== -1) {
      const updated = [...selectedItems];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, itemToAdd]);
    }
    setPopupItem(null);
  };

  const handlePay = () => {
    if (selectedItems.length > 0) {
      setIsRecommendationPopupVisible(true);
    } else {
      alert('메뉴를 선택해주세요.');
    }
  };

  const handleConfirmOrder = () => {
    const allItems = [...selectedItems, ...recommendedItems.map((i) => ({ name: i.name, price: i.price, quantity: 1 }))];
    allItems.forEach((item) => addItem(item));
    setIsRecommendationPopupVisible(false);
    router.push('/order-details');
  };

  const handleSkipRecommendation = () => {
    selectedItems.forEach((item) => addItem(item));
    setIsRecommendationPopupVisible(false);
    router.push('/order-details');
  };

  const handleCancelAll = () => setSelectedItems([]);

  const handleCallEmployee = () => {
    setIsEmployeePopupVisible(true);
    setIsBackgroundDimmed(true);
    setTimeout(() => { setIsEmployeePopupVisible(false); setIsBackgroundDimmed(false); }, 5000);
  };

  return (
    <div className="general-menu-screen">
      {isBackgroundDimmed && <div className="generalmenu-overlay"></div>}
      <div className="generalmenu-top-bar">
        <h1 className="generalmenu-store-name">Fastfood Kiosk</h1>
        <div>
          <button className="generalmenu-call-employee-button" onClick={handleCallEmployee}>직원호출</button>
          <button className="generalmenu-home-button" onClick={() => router.push('/')}>홈</button>
        </div>
      </div>
      <div className="generalmenu-category-tabs">
        {Object.keys(categoryMapping).map((cat) => (
          <button
            key={cat}
            className={`generalmenu-category-tab ${selectedCategory === categoryMapping[cat] ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(categoryMapping[cat]); setCurrentPage(0); }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="generalmenu-menu-grid-container">
        <div className="generalmenu-menu-grid">
          {currentItems.map((item, idx) => (
            <div key={idx} className="generalmenu-menu-item" onClick={() => handleItemClick(item)}>
              <div className="generalmenu-menu-image">
                <img src={item.img} alt={item.name} />
                {selectedCategory === 'new' && <span className="generalmenu-new-label">NEW</span>}
                {item.best && <span className="generalmenu-best-label">BEST</span>}
              </div>
              <div className="generalmenu-menu-name">{item.name}</div>
              <div className="generalmenu-menu-price">₩{item.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="generalmenu-pagination-controls">
        <button className="generalmenu-previous-button" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>이전</button>
        <button className="generalmenu-next-button" onClick={() => setCurrentPage(currentPage + 1)} disabled={(currentPage + 1) * itemsPerPage >= menuData[selectedCategory].length}>다음</button>
      </div>
      <div className="generalmenu-order-history"><h2>주문 내역</h2></div>
      <div className="generalmenu-order-summary">
        <div className="generalmenu-order-summary-header">
          <span>제품명</span><span>수량</span><span>금액</span>
        </div>
        <div className="generalmenu-order-items">
          {selectedItems.length > 0 ? selectedItems.map((item, idx) => (
            <div key={idx} className="generalmenu-order-item">
              <span>{item.name} {item.option && `(${item.option})`}</span>
              <span>{item.quantity}</span>
              <span>₩{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          )) : <div className="generalmenu-order-item empty-space">원하시는 메뉴를 담아주세요.</div>}
        </div>
      </div>
      <div className="generalmenu-order-controls">
        <button className="generalmenu-cancel-all-button" onClick={handleCancelAll}>전체취소</button>
        <button className="generalmenu-pay-button" onClick={handlePay}>결제</button>
      </div>

      {popupItem && (
        <div className="generalmenu-menu-popup">
          <div className="generalmenu-popup-content">
            <div className="generalmenu-popup-header">
              <h2>메뉴 선택</h2>
              <button className="generalmenu-close-popup" onClick={() => setPopupItem(null)}>×</button>
            </div>
            <div className="generalmenu-popup-body">
              <div className="generalmenu-popup-image">
                <img src={popupItem.img} alt={popupItem.name} />
              </div>
              <div className="generalmenu-popup-details">
                <h3 dangerouslySetInnerHTML={{ __html: popupItem.name.replace(/\n/g, '<br />') }} />
                <p dangerouslySetInnerHTML={{ __html: popupItem.description }} />
                {(popupItem.name.includes('코카콜라') || popupItem.name.includes('사이다')) && (
                  <div className="generalmenu-option-selection">
                    <button onClick={() => handleOptionChange('M')} className={`generalmenu-option-button ${selectedOption === 'M' ? 'active' : ''}`}>M(₩2000)</button>
                    <button onClick={() => handleOptionChange('L')} className={`generalmenu-option-button ${selectedOption === 'L' ? 'active' : ''}`}>L(₩2200)</button>
                  </div>
                )}
                {popupItem.name.includes('아메리카노') && (
                  <div className="generalmenu-option-selection">
                    <button onClick={() => handleOptionChange('HOT')} className={`generalmenu-option-button ${selectedOption === 'HOT' ? 'active' : ''}`}>HOT(₩2600)</button>
                    <button onClick={() => handleOptionChange('ICE')} className={`generalmenu-option-button ${selectedOption === 'ICE' ? 'active' : ''}`}>ICE(₩2600)</button>
                  </div>
                )}
                <p className="generalmenu-popup-price">₩{popupPrice.toLocaleString()}</p>
                <div className="generalmenu-quantity-selection">
                  <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="general-popup-footer">
              <button className="general-cancel-button" onClick={() => setPopupItem(null)}>취소</button>
              <button className="general-add-button" onClick={handleAddToOrder}>담기</button>
            </div>
          </div>
        </div>
      )}

      {isRecommendationPopupVisible && (
        <div className="recommendation-popup">
          <div className="recommendation-popup-content">
            <div className="recommendation-popup-header">
              <h2>추천 메뉴</h2>
              <button className="recommendation-close-popup" onClick={handleSkipRecommendation}>×</button>
            </div>
            <div className="recommendation-subtext-container">
              <p className="recommendation-subtext">함께 즐기면 더욱 좋습니다!</p>
            </div>
            <div className="recommendation-menu-list">
              {recommendedMenus.map((item) => (
                <div
                  key={item.name}
                  className={`recommendation-item ${recommendedItems.some((s) => s.name === item.name) ? 'selected' : ''}`}
                  onClick={() => setRecommendedItems((prev) =>
                    prev.some((s) => s.name === item.name)
                      ? prev.filter((s) => s.name !== item.name)
                      : [...prev, item]
                  )}
                >
                  <div className="recommendation-menu-photo-container">
                    <img src={item.img} alt={item.name} />
                  </div>
                  <p className="recommendation-menu-name" dangerouslySetInnerHTML={{ __html: item.name.replace(/\n/g, '<br />') }} />
                  <div className="recommendation-menu-price-container">
                    <span>₩{item.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="recommendation-popup-footer">
              <button className="recommendation-unselect-button" onClick={handleSkipRecommendation}>선택안함</button>
              <button className="recommendation-confirm-button" onClick={handleConfirmOrder}>담기</button>
            </div>
          </div>
        </div>
      )}

      {isEmployeePopupVisible && (
        <div className="general-employee-popup">
          <div className="general-employee-popup-content">
            <p className="general-employee-popup-message">직원을 호출했습니다! 잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralMenuScreen;
