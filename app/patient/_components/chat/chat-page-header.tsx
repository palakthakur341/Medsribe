import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ChatPageHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
  className?: string;
}

export function ChatPageHeader({ 
  title, 
  description, 
  onBack, 
  className = "" 
}: ChatPageHeaderProps) {
  return (
    <div className={`flex-shrink-0 space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
