export interface Review {
  author: string;
  rating: number;
  content: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  type: 'pharmacy' | 'marketplace';
  link?: string;
  imageEmoji: string;
}

export interface SupplementCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  benefits: string[];
  targetConcerns: string[];
  pharmacyProducts: Product[];
  marketplaceProducts: Product[];
}

export interface QuestionnaireAnswers {
  concerns: string[];
  age: string;
  diet: string;
  sunlight: string;
  symptoms: string[];
}

export interface RecommendedCategory {
  categoryId: string;
  reason: string;
  priority: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance?: number;
}
