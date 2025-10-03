interface UpdatedAtBadgeProps {
  updatedAt?: string | null;
  className?: string;
}

/**
 * 最終更新日を表示する共通コンポーネント
 */
export function UpdatedAtBadge({ updatedAt, className = "" }: UpdatedAtBadgeProps) {
  const formattedDate = updatedAt 
    ? new Date(updatedAt).toLocaleDateString() 
    : '不明';

  return (
    <div className={`text-xs text-neutral-400 ${className}`}>
      最終更新: {formattedDate}
    </div>
  );
}
