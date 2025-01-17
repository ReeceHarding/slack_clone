import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      // This function will eventually call the back-end
      console.log("Send button clicked:", message);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative" data-testid="chat-widget">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="transparent"
        className="flex flex-col items-center justify-center gap-y-0.5 group"
      >
        <div className={`size-9 p-2 group-hover:bg-accent/20 ${isOpen ? "bg-accent/20" : ""}`}>
          <MessageSquareText className="size-5 text-white group-hover:scale-110 transition-all" />
        </div>
        <span className="text-[11px] text-white group-hover:text-accent">Chat</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-white rounded-lg shadow-lg p-4" data-testid="chat-window">
          <div className="h-80 overflow-y-auto mb-4 border rounded-md p-2">
            {/* Chat messages will go here */}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
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
      )}
    </div>
  );
}; 