import React, { createContext, useContext, useState } from 'react';

const VariantContext = createContext();

export const useVariant = () => useContext(VariantContext);

export const VariantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [mode, setMode] = useState('buy'); // 'buy' or 'add'

  const openVariantModal = (targetProduct, targetMode = 'buy') => {
    setProduct(targetProduct);
    setMode(targetMode);
    setIsOpen(true);
  };

  const closeVariantModal = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <VariantContext.Provider value={{ 
      isOpen, 
      product, 
      mode, 
      openVariantModal, 
      closeVariantModal 
    }}>
      {children}
    </VariantContext.Provider>
  );
};
