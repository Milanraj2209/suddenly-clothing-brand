export const imageMap = {
  'product_1.png': 'https://plus.unsplash.com/premium_photo-1671147506161-4638a164c865?q=80&w=1470&auto=format&fit=crop',
  'product_2.png': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1440&auto=format&fit=crop',
  'hero_image.png': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1470&auto=format&fit=crop',
  'category_new.png': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop',
  'knitwear.png': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1410&auto=format&fit=crop',
  'accessories.png': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1480&auto=format&fit=crop',
  'studio_shot.png': 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1471&auto=format&fit=crop',
  'silk_details.png': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1364&auto=format&fit=crop'
};

export const getImageUrl = (key) => {
  if (!key) return imageMap['product_1.png'];
  if (key.startsWith('/uploads/') || key.startsWith('http')) return key;
  return imageMap[key] || imageMap['product_1.png'];
};

export const getAllImages = () => Object.entries(imageMap).map(([key, url]) => ({ key, url }));
