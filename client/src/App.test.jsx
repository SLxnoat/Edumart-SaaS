import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('EduMart app shell', () => {
  it('renders the landing page headline', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Buy and sell quality learning materials/i)).toBeTruthy();
  });

  it('shows the main navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Catalog')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });
});
