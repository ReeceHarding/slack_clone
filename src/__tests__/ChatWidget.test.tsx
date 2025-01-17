import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from '../components/chat/chat-widget';
import '@testing-library/jest-dom';

jest.mock('convex/react', () => ({
  useConvex: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ChatWidget', () => {
  it('renders chat button initially', () => {
    render(<ChatWidget />);
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('shows chat window when clicked', async () => {
    render(<ChatWidget />);
    const chatButton = screen.getByTestId('chat-widget');
    
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
  });

  it('allows typing and sending messages, and displays the conversation', async () => {
    render(<ChatWidget />);
    const chatButton = screen.getByTestId('chat-widget');
    
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
    
    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    const sendButton = screen.getByTestId('send-button');
    const messageText = 'Hello, how are you?';
    
    fireEvent.change(input, { target: { value: messageText } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(messageText)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    render(<ChatWidget />);
    const chatButton = screen.getByTestId('chat-widget');
    
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
    
    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error sending message')).toBeInTheDocument();
    });
  });

  it('prevents sending empty messages', async () => {
    render(<ChatWidget />);
    const chatButton = screen.getByTestId('chat-widget');
    
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
    
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.click(sendButton);
    
    expect(screen.queryByTestId('message')).not.toBeInTheDocument();
  });
}); 