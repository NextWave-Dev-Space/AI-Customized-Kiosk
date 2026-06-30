'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { MenuItem, OrderItem } from '@/types';
import './ElderlyMenuScreen.css';

const menuData: Record<string, MenuItem[]> = {
  new: [
    { name: '통새우 버거', price: 4700, img: '/images/chicken_burger.png', description: '통통한 통새우에 새콤달콤 특제소스를 듬뿍 넣은 버거' },
    { name: '화이트갈릭버거', price: 4900, img: '/images/cheese_burger.png', description: '부드러운 마늘 소스에 더블 햄과 통가슴살 패티로 조합한 버거' },
    { name: '할라피뇨통살버거', price: 4800, img: '/images/shrimp_jalapeno_burger.png', description: '바삭한 통다리살 패티와 매콤한 할라피뇨 소스를 조합한 버거' },
  ],
  single: [
    { name: '불고기 버거', price: 3900, img: '/images/bulgogi_burger.png', description: '불고기 소스에 숙성한 패티와 신선한 양상추를 조합한 버거', best: true },
    { name: '더블 불고기 버거', price: 5200, img: '/images/shrimp_jalapeno_burger.png', description: '불고기 소스에 숙성한 패티 두 장' },
    { name: '치즈버거', price: 3300, img: '/images/bulgogi_burger.png', description: '고소하고 부드러운 치즈와 100% 순 쇠고기 패티' },
    { name: '고급 치즈버거', price: 5400, img: '/images/cheese_burger.png', description: '4가지 고급 치즈와 불에 직접 구운 패티' },
    { name: '데리버거', price: 3300, img: '/images/bulgogi_burger.png', description: '쇠고기 패티에 달콤 짭짤한 간장 마늘 소스' },
    { name: '치킨버거', price: 4000, img: '/images/chicken_burger.png', description: '닭고기 패티와 달콤 짭짤한 간장 마늘 소스로 만든 버거' },
    { name: '핫크리스피 버거', price: 5900, img: '/images/shrimp_jalapeno_burger.png', description: '닭가슴살 패티로 만든 매콤하고 화끈한 치킨버거' },
    { name: '토마토치즈\n비프버거', price: 3800, img: '/images/tomato_burger.png', description: '쇠고기 패티에 신선한 토마토와 고소한 치즈', best: true },
  ],
  set: [
    { name: '불고기 버거 세트', price: 6200, img: '/images/burger_set.png', description: '불고기 버거 세트' },
    { name: '더블불고기 버거세트', price: 7500, img: '/images/burger_set.png', description: '더블 불고기 버거 세트' },
    { name: '치즈버거 세트', price: 5500, img: '/images/burger_set.png', description: '치즈버거 세트' },
    { name: '데리버거 세트', price: 5600, img: '/images/burger_set.png', description: '데리버거 세트', best: true },
    { name: '치킨버거 세트', price: 6300, img: '/images/burger_set.png', description: '치킨버거 세트' },
    { name: '핫크리스피 버거세트', price: 7800, img: '/images/burger_set.png', description: '핫크리스피 버거 세트', best: true },
    { name: '토마토치즈비프 버거 세트', price: 5600, img: '/images/burger_set.png', description: '토마토치즈비프 버거 세트' },
  ],
  drink: [
    { name: '코카콜라', price: 2000, img: '/images/coke.png', description: '톡 쏘는 시원함과 상쾌함', best: true },
    { name: '사이다', price: 2000, img: '/images/soda.png', description: '톡 쏘는 시원함' },
    { name: '아메리카노', price: 2600, img: '/images/coffee.png', description: '아라비카 원두 100% 부드러운 커피' },
    { name: '오렌지 주스', price: 2500, img: '/images/orange_juice.png', description: '비타민 C를 100% 함유한 오렌지 주스' },
    { name: '생수', price: 1000, img: '/images/water.png', description: '활력을 되찾아주는 깔끔한 생수' },
  ],
  side: [
    { name: '치킨너겟', price: 2700, img: '/images/nuggets.png', description: '닭안심살과 닭가슴살로 만든 치킨너겟 (5조각+소스)' },
    { name: '후렌치 후라이', price: 2200, img: '/images/frenchfries.png', description: '통으로 썰어낸 감자를 튀겨낸 바삭한 감자튀김', best: true },
    { name: '치즈스틱', price: 2400, img: '/images/cheese_stick.png', description: '통 모짜렐라 치즈에 튀김옷을 입혀 만든 치즈스틱 (2조각)' },
    { name: '아이스크림콘', price: 1300, img: '/images/ice_cream.png', description: '신선한 우유로 만든 부드러운 아이스크림콘', best: true },
    { name: '코울슬로', price: 1900, img: '/images/coleslaw.png', description: '양배추, 당근, 양파가 마요네즈 드레싱과 어우러진 샐러드' },
    { name: '소스', price: 500, img: '/images/source.png', description: '치킨너겟, 감자튀김용 소스 (칠리맛)' },
  ],
};

const categoryMapping: Record<string, string> = {
  '신메뉴': 'new', '단품': 'single', '세트': 'set', '음료': 'drink', '간식': 'side',
};

const itemsPerPage = 6;

const ElderlyMenuScreen = () => {
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

  const currentItems = menuData[selectedCategory].slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleItemClick = (item: MenuItem) => {
    setPopupItem(item); setQuantity(1); setSelectedOption(null); setPopupPrice(item.price);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    if (popupItem && (popupItem.name === '코카콜라' || popupItem.name === '사이다')) {
      setPopupPrice(option === 'L' ? 2200 : 2000);
    }
  };

  const handleAddToOrder = () => {
    if (!popupItem) return;
    if (!selectedOption && (popupItem.name === '코카콜라' || popupItem.name === '사이다' || popupItem.name === '아메리카노')) {
      alert('옵션을 선택해주세요.'); return;
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
      selectedItems.forEach((item) => addItem(item));
      router.push('/elderly-order-details');
    } else {
      alert('메뉴를 선택해주세요.');
    }
  };

  const handleCallEmployee = () => {
    setIsEmployeePopupVisible(true);
    setIsBackgroundDimmed(true);
    setTimeout(() => { setIsEmployeePopupVisible(false); setIsBackgroundDimmed(false); }, 5000);
  };

  return (
    <div className="ElderlyMenu-menu-screen">
      {isBackgroundDimmed && <div className="ElderlyMenu-menu-overlay"></div>}
      <div className="ElderlyMenu-menu-top-bar">
        <h1 className="ElderlyMenu-menu-store-name">패스트푸드점 키오스크</h1>
        <div>
          <button className="ElderlyMenu-menu-call-employee-button" onClick={handleCallEmployee}>직원호출</button>
          <button className="ElderlyMenu-menu-home-button" onClick={() => router.push('/')}>홈</button>
        </div>
      </div>
      <div className="ElderlyMenu-menu-category-tabs">
        {Object.keys(categoryMapping).map((cat) => (
          <button
            key={cat}
            className={`ElderlyMenu-menu-category-tab ${selectedCategory === categoryMapping[cat] ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(categoryMapping[cat]); setCurrentPage(0); }}
          >{cat}</button>
        ))}
      </div>
      <div className="ElderlyMenu-menu-grid-container">
        <div className="ElderlyMenu-menu-grid">
          {currentItems.map((item, idx) => (
            <div key={idx} className="ElderlyMenu-menu-item" onClick={() => handleItemClick(item)}>
              <div className="ElderlyMenu-menu-image">
                <img src={item.img} alt={item.name} />
                {selectedCategory === 'new' && <span className="ElderlyMenu-menu-new-label">신상</span>}
                {item.best && <span className="ElderlyMenu-menu-best-label">인기</span>}
              </div>
              <div className="ElderlyMenu-menu-name">{item.name}</div>
              <div className="ElderlyMenu-menu-price">₩{item.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ElderlyMenu-menu-pagination-controls">
        <button className="ElderlyMenu-menu-previous-button" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>이전</button>
        <button className="ElderlyMenu-menu-next-button" onClick={() => setCurrentPage(currentPage + 1)} disabled={(currentPage + 1) * itemsPerPage >= menuData[selectedCategory].length}>다음</button>
      </div>
      <div className="ElderlyMenu-menu-order-history"><h2>주문 내역</h2></div>
      <div className="ElderlyMenu-menu-order-summary">
        <div className="ElderlyMenu-menu-order-summary-header">
          <span>제품명</span><span>수량</span><span>금액</span>
        </div>
        <div className="ElderlyMenu-menu-order-items">
          {selectedItems.length > 0 ? selectedItems.map((item, idx) => (
            <div key={idx} className="ElderlyMenu-menu-order-item">
              <span>{item.name} {item.option && `(${item.option})`}</span>
              <span>{item.quantity}</span>
              <span>₩{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          )) : <div className="ElderlyMenu-menu-order-item empty-space">원하시는 메뉴를 담아주세요.</div>}
        </div>
      </div>
      <div className="ElderlyMenu-menu-order-controls">
        <button className="ElderlyMenu-menu-cancel-all-button" onClick={() => setSelectedItems([])}>전체취소</button>
        <button className="ElderlyMenu-menu-pay-button" onClick={handlePay}>결제</button>
      </div>

      {popupItem && (
        <div className="ElderlyMenu-menu-popup">
          <div className="ElderlyMenu-menu-popup-content">
            <div className="ElderlyMenu-menu-popup-header">
              <h2>메뉴 선택</h2>
              <button className="ElderlyMenu-menu-close-popup" onClick={() => setPopupItem(null)}>×</button>
            </div>
            <div className="ElderlyMenu-menu-popup-body">
              <div className="ElderlyMenu-menu-popup-image">
                <img src={popupItem.img} alt={popupItem.name} />
              </div>
              <div className="ElderlyMenu-menu-popup-details">
                <h3 dangerouslySetInnerHTML={{ __html: popupItem.name.replace(/\n/g, '<br />') }} />
                <p dangerouslySetInnerHTML={{ __html: popupItem.description }} />
                {(popupItem.name === '코카콜라' || popupItem.name === '사이다') && (
                  <div className="ElderlyMenu-menu-option-selection">
                    <button onClick={() => handleOptionChange('M')} className={`ElderlyMenu-menu-option-button ${selectedOption === 'M' ? 'active' : ''}`}>중(₩2000)</button>
                    <button onClick={() => handleOptionChange('L')} className={`ElderlyMenu-menu-option-button ${selectedOption === 'L' ? 'active' : ''}`}>대(₩2200)</button>
                  </div>
                )}
                {popupItem.name === '아메리카노' && (
                  <div className="ElderlyMenu-menu-option-selection">
                    <button onClick={() => handleOptionChange('HOT')} className={`ElderlyMenu-menu-option-button ${selectedOption === 'HOT' ? 'active' : ''}`}>뜨겁게(₩2600)</button>
                    <button onClick={() => handleOptionChange('ICE')} className={`ElderlyMenu-menu-option-button ${selectedOption === 'ICE' ? 'active' : ''}`}>차갑게(₩2600)</button>
                  </div>
                )}
                <p className="ElderlyMenu-menu-popup-price">₩{popupPrice.toLocaleString()}</p>
                <div className="ElderlyMenu-menu-quantity-selection">
                  <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="ElderlyMenu-menu-popup-footer">
              <button className="ElderlyMenu-menu-cancel-button" onClick={() => setPopupItem(null)}>취소</button>
              <button className="ElderlyMenu-menu-add-button" onClick={handleAddToOrder}>담기</button>
            </div>
          </div>
        </div>
      )}
      {isEmployeePopupVisible && (
        <div className="ElderlyMenu-menu-employee-popup">
          <div className="ElderlyMenu-menu-employee-popup-content">
            <p className="ElderlyMenu-menu-employee-popup-message">직원을 호출했습니다! 잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderlyMenuScreen;
