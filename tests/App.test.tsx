import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import App from '../src/App';

// Стубируем fetch в тестовой среде: возвращаем пустой массив,
// чтобы избежать ошибок "Invalid URL" при обращении к относительным путям.
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as any;
});

describe('App routing', () => {
  it('renders dashboard by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
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
