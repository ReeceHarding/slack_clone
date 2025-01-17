import { useState, useEffect } from "react";
import { MessageSquareText, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      const userMessage = message.trim();
      
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setMessage("");

      // Call API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="relative" data-testid="chat-widget">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="transparent"
          className="flex flex-col items-center justify-center gap-y-0.5 group"
        >
          <div className={`size-9 p-2 group-hover:bg-accent/20 ${isOpen ? "bg-accent/20" : ""}`}>
            <MessageSquareText className="size-5 text-white group-hover:scale-110 transition-all" />
          </div>
          <span className="text-[11px] text-white group-hover:text-accent">AI Chat</span>
        </Button>
      </div>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] bg-white rounded-lg shadow-lg p-4 z-50" 
            data-testid="chat-window"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Messages */}
            <div 
              className="h-[60vh] max-h-[500px] overflow-y-auto mb-4 border rounded-md p-2 flex flex-col gap-2" 
              data-testid="chat-messages"
            >
              {messages.length === 0 && (
                <div className="text-gray-500 text-sm p-4 text-center">
                  <p className="mb-2">👋 Welcome to the Slack Chat Assistant!</p>
                  <p>Ask me anything about your Slack conversations, channels, or workspace history. I can help you find specific messages, summarize discussions, or answer questions about past conversations.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about your Slack history, messages, or channels..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                data-testid="chat-input"
                className="flex-1"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                onClick={handleSend}
                size="icon"
                data-testid="send-button"
                disabled={isSending}
              >
                <Send className={`size-4 ${isSending ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}; 