import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

// Mock fetch
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: false }),
  })
);

import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders without crashing', () => {
    expect(typeof HomePage).toBe('function');
    const html = ReactDOMServer.renderToString(React.createElement(HomePage));
    expect(html).toContain('Live Canvas Interactive Simulator');
    expect(html).toContain('HIRE ME');
  });
});
