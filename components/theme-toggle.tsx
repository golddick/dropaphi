// components/ui/theme-toggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 animate-pulse bg-muted rounded-lg" />;
  }

  const getIcon = () => {
    if (theme === 'dark') return <Sun size={16} />;
    if (theme === 'light') return <Moon size={16} />;
    return <Laptop size={16} />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors w-full"
      >
        {getIcon()}
        <span className="text-sm flex-1 hidden md:block text-left">{getLabel()}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover rounded-lg shadow-lg border z-20 overflow-hidden">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  <span className='hidden md:block'>{themeOption.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}