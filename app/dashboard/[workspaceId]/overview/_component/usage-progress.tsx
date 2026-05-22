'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageProgressProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  color: string;
  icon: LucideIcon;
  unit?: string;
  walletCredits?: number;
  onTopUp?: () => void;
  isUnavailable?: boolean;
}

export function UsageProgress({ 
  title, 
  used, 
  limit, 
  percentage, 
  color, 
  icon: Icon,
  unit = '',
  walletCredits = 0,
  onTopUp,
  isUnavailable = false
}: UsageProgressProps) {
  const totalCapacity = limit + walletCredits;
  const realPercentage = isUnavailable ? 0 : (totalCapacity > 0 ? Math.min(100, Math.round((used / totalCapacity) * 100)) : 0);

  const getProgressColor = () => {
    if (isUnavailable) return 'bg-muted-foreground/20';
    if (realPercentage >= 90) return 'bg-destructive';
    if (realPercentage >= 75) return 'bg-yellow-500';
    return ''; // Will use inline style
  };

  const getTextColor = () => {
    if (isUnavailable) return 'text-muted-foreground';
    if (realPercentage >= 90) return 'text-destructive';
    if (realPercentage >= 75) return 'text-yellow-500';
    return ''; // Will use inline style
  };

  return (
    <div 
      className={cn(
        "p-6 rounded-lg border flex flex-col h-full bg-card border-border transition-opacity",
        isUnavailable && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: isUnavailable ? 'transparent' : `${color}15` }}
          >
            <Icon size={20} style={{ color: isUnavailable ? '#94a3b8' : color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">
                {title}
              </h3>
              {isUnavailable && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">
                  Unavailable
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isUnavailable ? 'Service temporarily disabled' : `${used.toLocaleString()} / ${totalCapacity.toLocaleString()} ${unit}`}
            </p>
            {!isUnavailable && walletCredits > 0 && (
                <p className="text-[10px] text-green-500 font-medium">
                   (incl. {walletCredits.toLocaleString()} wallet credits)
                </p>
            )}
          </div>
        </div>
        <span 
          className={cn("text-sm font-bold", getTextColor())}
          style={!isUnavailable && realPercentage < 75 ? { color } : {}}
        >
          {isUnavailable ? '-' : `${realPercentage}%`}
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-muted">
        <div
          className={cn("h-full transition-all duration-300", getProgressColor())}
          style={{
            width: `${realPercentage}%`,
            ...(!isUnavailable && realPercentage < 75 ? { backgroundColor: color } : {}),
          }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3 grow justify-end">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Wallet Credits:</span>
          <span className={cn("font-medium", !isUnavailable && walletCredits > 0 ? "text-green-500" : "text-muted-foreground")}>
            {isUnavailable ? 'N/A' : `${walletCredits.toLocaleString()} ${unit}`}
          </span>
        </div>
        
        <button
          onClick={onTopUp}
          disabled={isUnavailable}
          className={cn(
            "w-full py-2 px-4 rounded-md text-xs font-medium transition-colors border bg-transparent",
            isUnavailable ? "cursor-not-allowed border-muted text-muted-foreground" : ""
          )}
          style={!isUnavailable ? { 
            borderColor: color, 
            color: color,
          } : {}}
          onMouseEnter={(e) => {
            if (!isUnavailable) (e.target as HTMLButtonElement).style.backgroundColor = `${color}15`;
          }}
          onMouseLeave={(e) => {
            if (!isUnavailable) (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          {isUnavailable ? 'Service Unavailable' : `Top Up ${title}`}
        </button>
      </div>

      {!isUnavailable && realPercentage >= 90 && !walletCredits && (
        <p className="text-xs mt-2 flex items-center gap-1 text-destructive">
          <span>⚠️</span> Limit reached.
        </p>
      )}
    </div>
  );
}