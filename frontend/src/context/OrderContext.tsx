'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { OrderItem } from '@/types';

interface OrderContextValue {
  selectedItems: OrderItem[];
  addItem: (item: OrderItem) => void;
  cancelAll: () => void;
  userType: 'general' | 'elderly' | 'children';
  setUserType: (type: 'general' | 'elderly' | 'children') => void;
  dineOption: string;
  setDineOption: (opt: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [userType, setUserType] = useState<'general' | 'elderly' | 'children'>('general');
  const [dineOption, setDineOption] = useState('dine_in');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [discountAmount, setDiscountAmount] = useState(0);

  const addItem = (newItem: OrderItem) => {
    setSelectedItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.name === newItem.name && i.option === newItem.option
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + newItem.quantity };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const cancelAll = () => setSelectedItems([]);

  return (
    <OrderContext.Provider
      value={{
        selectedItems,
        addItem,
        cancelAll,
        userType,
        setUserType,
        dineOption,
        setDineOption,
        paymentMethod,
        setPaymentMethod,
        discountAmount,
        setDiscountAmount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextValue => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
};
