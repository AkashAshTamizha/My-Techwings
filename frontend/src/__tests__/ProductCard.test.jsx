import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/common/StarRating';

const sampleProduct = {
  _id: '1',
  slug: 'test-laptop',
  name: 'Test Laptop',
  category: 'Ultrabook',
  price: 99999,
  rating: 4,
  reviewCount: 12,
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Laptop')).toBeInTheDocument();
    expect(screen.getByText(/99,999/)).toBeInTheDocument();
  });
});

describe('StarRating', () => {
  it('renders review count', () => {
    render(<StarRating rating={4} reviewCount={25} />);
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });
});
