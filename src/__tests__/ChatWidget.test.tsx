import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatWidget } from "@/components/ChatWidget";

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("ChatWidget", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders the chat bubble", () => {
    render(<ChatWidget />);
    const bubble = screen.getByTestId("chat-widget");
    expect(bubble).toBeInTheDocument();
  });

  it("shows chat window when clicked", () => {
    render(<ChatWidget />);
    const bubble = screen.getByTestId("chat-widget");
    
    // Chat window should not be visible initially
    expect(screen.queryByTestId("chat-window")).not.toBeInTheDocument();
    
    // Click the bubble
    fireEvent.click(bubble);
    
    // Chat window should now be visible
    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
  });

  it("allows typing and sending messages, and displays the conversation", async () => {
    // Mock successful API response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ answer: "I'm doing well, thank you!" }),
      })
    );

    render(<ChatWidget />);
    
    // Open chat window
    fireEvent.click(screen.getByTestId("chat-widget"));
    
    // Type a message
    const input = screen.getByTestId("chat-input") as HTMLInputElement;
    const sendButton = screen.getByTestId("send-button");
    const messageText = "Hello, how are you?";
    
    fireEvent.change(input, { target: { value: messageText } });
    expect(input).toHaveValue(messageText);
    
    // Send message
    fireEvent.click(sendButton);
    
    // Button and input should be disabled while sending
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    
    // Wait for the send operation to complete
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(sendButton).not.toBeDisabled();
    });
    
    // Input should be cleared after sending
    expect(input).toHaveValue("");

    // Check if messages are displayed
    const messages = screen.getByTestId("chat-messages");
    expect(messages).toHaveTextContent(messageText);
    expect(messages).toHaveTextContent("I'm doing well, thank you!");

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: messageText }),
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock failed API response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByTestId("chat-widget"));
    
    const input = screen.getByTestId("chat-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("send-button"));

    // Wait for error handling to complete
    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });

    // User message should still be displayed
    const messages = screen.getByTestId("chat-messages");
    expect(messages).toHaveTextContent("Hello");
  });

  it("prevents sending empty messages", async () => {
    render(<ChatWidget />);
    
    // Open chat window
    fireEvent.click(screen.getByTestId("chat-widget"));
    
    // Try to send empty message
    const input = screen.getByTestId("chat-input") as HTMLInputElement;
    const sendButton = screen.getByTestId("send-button");
    
    fireEvent.click(sendButton);
    
    // Input and button should not be disabled
    expect(input).not.toBeDisabled();
    expect(sendButton).not.toBeDisabled();

    // No messages should be displayed
    const messages = screen.getByTestId("chat-messages");
    expect(messages).toBeEmptyDOMElement();
  });
}); 