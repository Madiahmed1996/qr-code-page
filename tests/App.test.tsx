import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App routing', () => {
  it('renders dashboard by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    // Ищем заголовок первого уровня с нужным текстом, чтобы избежать
    // коллизий из других компонентов.
    const heading = screen.getByRole('heading', { name: /Дашборд/i });
    expect(heading).toBeTruthy();
  });

  it('navigates to employees page', () => {
    render(
      <MemoryRouter initialEntries={['/employees']}>
        <App />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { name: /Сотрудники/i });
    expect(heading).toBeTruthy();
  });
});
