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

describe("ChatWidget", () => {
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

  it("allows typing and sending messages", async () => {
    render(<ChatWidget />);
    
    // Open chat window
    fireEvent.click(screen.getByTestId("chat-widget"));
    
    // Type a message
    const input = screen.getByTestId("chat-input") as HTMLInputElement;
    const sendButton = screen.getByTestId("send-button");
    
    fireEvent.change(input, { target: { value: "Hello, world!" } });
    expect(input).toHaveValue("Hello, world!");
    
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
  });
}); 