import { LucideIcon } from "lucide-react";

interface ChatEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChatEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  iconSize = 'md',
  className = "" 
}: ChatEmptyStateProps) {
  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon className={`${iconSizeClasses[iconSize]} text-muted-foreground mx-auto mb-3`} />
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
