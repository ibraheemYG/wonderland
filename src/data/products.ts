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
  description?: string;
  images?: string[];
}

// «·„‰ Ã«  «·«› —«÷Ì…  „ Õ–›Â« - ”Ì „ «·—›⁄ „‰ «·≈œ«—… ›ﬁÿ
export const baseProducts: ProductRecord[] = [];
