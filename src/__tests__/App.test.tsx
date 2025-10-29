import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as mockData from '@utils/mockData';

// Mock the mockData module
vi.mock('@utils/mockData', () => ({
  initializeMockData: vi.fn(),
}));

// Mock ChatLayout component
vi.mock('@components/ChatLayout/ChatLayout', () => ({
  ChatLayout: () => <div>ChatLayout Component</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('ChatLayout Component')).toBeInTheDocument();
  });

  it('should call initializeMockData on mount', () => {
    render(<App />);
    expect(mockData.initializeMockData).toHaveBeenCalledTimes(1);
  });

  it('should render ChatLayout component', () => {
    render(<App />);
    expect(screen.getByText('ChatLayout Component')).toBeInTheDocument();
  });

  it('should only initialize mock data once', () => {
    const { rerender } = render(<App />);
    expect(mockData.initializeMockData).toHaveBeenCalledTimes(1);

    rerender(<App />);
    expect(mockData.initializeMockData).toHaveBeenCalledTimes(1);
  });
});
