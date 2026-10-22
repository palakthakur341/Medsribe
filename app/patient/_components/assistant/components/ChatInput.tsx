import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { ChatInputProps, QUICK_SUGGESTIONS } from "../types";

export const ChatInput: React.FC<ChatInputProps> = React.memo(({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  disabled = false
}) => {
  const handleSuggestionClick = useCallback((message: string) => {
    onChange(message);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={handleInputChange}
            onKeyDown={onKeyPress}
            placeholder="Ask me about your SOAP notes, care plans, symptoms, medications..."
            disabled={isLoading || disabled}
            className="flex-1"
          />
          <Button
            onClick={onSend}
            disabled={!value.trim() || isLoading || disabled}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion.label}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion.message)}
              disabled={isLoading || disabled}
              className="text-xs h-6"
            >
              {suggestion.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = "ChatInput";
