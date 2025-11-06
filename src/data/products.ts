export type ProductCategory =
  | 'living-room'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'decor'
  | 'appliances'
  | 'furnishings'
  | 'sale';

export interface ProductRecord {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  originalPrice?: number;
  category: ProductCategory;
  isCustom?: boolean;
  description?: string; // وصف اختياري
  images?: string[]; // معرض صور اختياري
}

export const baseProducts: ProductRecord[] = [
  {
    id: 1,
    name: 'Modern Sofa',
    price: 799,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    rating: 5,
    category: 'living-room',
    description: 'كنبة عصرية مريحة بتصميم اسكندنافي ولمسات ناعمة مناسبة لغرفة المعيشة.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
      'https://images.unsplash.com/photo-1616628182501-4bcf0b82b3be?w=1200',
    ],
  },
  {
    id: 2,
    name: 'Kitchen Island',
    price: 1299,
    originalPrice: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
    rating: 4,
    category: 'kitchen',
  },
  {
    id: 3,
    name: 'King Size Bed',
    price: 999,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    rating: 5,
    category: 'bedroom',
  },
  {
    id: 4,
    name: 'Bathroom Vanity',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
    rating: 4,
    category: 'bathroom',
  },
  {
    id: 5,
    name: 'Area Rug',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1600856209923-34372e319a5d?w=800',
    rating: 3,
    category: 'decor',
  },
  {
    id: 6,
    name: 'Smart Fridge',
    price: 2499,
    originalPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
    rating: 5,
    category: 'appliances',
  },
  {
    id: 7,
    name: 'Wall Painting',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    rating: 4,
    category: 'decor',
  },
  {
    id: 8,
    name: 'Living Room Set',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    rating: 5,
    category: 'living-room',
  },
  {
    id: 9,
    name: 'Relax Armchair',
    price: 549,
    imageUrl: 'https://images.unsplash.com/photo-1616628182501-4bcf0b82b3be?w=800',
    rating: 4,
    category: 'living-room',
  },
  {
    id: 10,
    name: 'Scandi Bedding Set',
    price: 259,
    imageUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800',
    rating: 5,
    category: 'bedroom',
  },
  {
    id: 11,
    name: 'Minimal Vanity Mirror',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    rating: 4,
    category: 'bathroom',
  },
  {
    id: 12,
    name: 'Smart Oven',
    price: 899,
    originalPrice: 1099,
    imageUrl: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=800',
    rating: 4,
    category: 'appliances',
  },
  {
    id: 13,
    name: 'Outdoor Bistro Set',
    price: 699,
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    rating: 4,
    category: 'sale',
  },
  {
    id: 14,
    name: 'Decorative Lighting',
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
    rating: 5,
    category: 'decor',
  },
  {
    id: 15,
    name: 'Velvet Cushion Set',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1582582494700-66b01a3f5f30?w=800',
    rating: 4,
    category: 'furnishings',
    description: 'طقم وسائد مخملية فاخرة يضيف دفئاً وأناقة للأريكة أو السرير.',
    images: [
      'https://images.unsplash.com/photo-1582582494700-66b01a3f5f30?w=1200',
      'https://images.unsplash.com/photo-1600856209923-34372e319a5d?w=1200',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200',
    ],
  },
  {
    id: 16,
    name: 'Linen Curtains',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1598300183555-854eaca1c082?w=800',
    rating: 5,
    category: 'furnishings',
    description: 'ستائر من الكتان بنسيج طبيعي تسمح بدخول الضوء بنعومة مع خصوصية مناسبة.',
    images: [
      'https://images.unsplash.com/photo-1598300183555-854eaca1c082?w=1200',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200',
      'https://images.unsplash.com/photo-1598300183699-453f564a0ec0?w=1200',
    ],
  },
  {
    id: 17,
    name: 'Wool Throw Blanket',
    price: 129,
    imageUrl: 'https://images.unsplash.com/photo-1545529468-42764ef8c85e?w=800',
    rating: 5,
    category: 'furnishings',
  },
  {
    id: 18,
    name: 'Patterned Cushion Covers (Set of 4)',
    price: 59,
    imageUrl: 'https://images.unsplash.com/photo-1598300174659-0f2c2a0a85c8?w=800',
    rating: 4,
    category: 'furnishings',
  },
  {
    id: 19,
    name: 'Textured Bed Throw',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
    rating: 4,
    category: 'furnishings',
  },
  {
    id: 20,
    name: 'Table Runner - Linen',
    price: 39,
    imageUrl: 'https://images.unsplash.com/photo-1582582494944-9a7cde6cfdb4?w=800',
    rating: 4,
    category: 'furnishings',
  },
  {
    id: 21,
    name: 'Cotton Bedspread',
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    rating: 5,
    category: 'furnishings',
    description: 'غطاء سرير قطني ناعم بقوام مريح ولمسة دافئة لغرفة النوم.',
  },
  {
    id: 22,
    name: 'Sheer Curtains (Pair)',
    price: 119,
    imageUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
    rating: 4,
    category: 'furnishings',
  },
  {
    id: 23,
    name: 'Blackout Curtains (Pair)',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1598300183699-453f564a0ec0?w=800',
    rating: 5,
    category: 'furnishings',
  },
  {
    id: 24,
    name: 'Decorative Pouf',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1551025370-9903a6531e0a?w=800',
    rating: 4,
    category: 'furnishings',
  },
];
