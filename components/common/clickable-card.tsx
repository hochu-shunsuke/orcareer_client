'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface ClickableCardProps {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}

/**
 * クリック可能でアクセシビリティ対応されたカードコンポーネント
 * キーボードナビゲーション（Enter/Space）に対応
 */
export function ClickableCard({ 
  onClick, 
  ariaLabel, 
  children, 
  className = "" 
}: ClickableCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow duration-200 relative cursor-pointer ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
    >
      <CardContent className="p-6 pb-20">
        {children}
      </CardContent>
    </Card>
  );
}
