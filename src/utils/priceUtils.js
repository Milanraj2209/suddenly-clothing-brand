export const calculateDiscount = (original, current) => {
  if (!original || !current) return null;
  
  const orig = parseFloat(original.toString().replace(/[₹,]/g, ''));
  const curr = parseFloat(current.toString().replace(/[₹,]/g, ''));
  
  if (isNaN(orig) || isNaN(curr) || orig <= curr) return null;
  
  const discount = ((orig - curr) / orig) * 100;
  return Math.round(discount);
};

export const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return '';
  
  // Strip everything except digits and decimal point
  const cleanPrice = parseFloat(price.toString().replace(/[₹,]/g, ''));
  
  if (isNaN(cleanPrice)) return price; // Fallback to original string if not a number
  
  return `₹${cleanPrice.toLocaleString('en-IN')}`;
};
