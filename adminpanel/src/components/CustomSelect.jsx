import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  variant = 'default', // 'default' | 'underline' | 'bordered'
  size = 'md', // 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange(optValue);
    setIsOpen(false);
  };

  // Styling based on variant
  const getTriggerClasses = () => {
    const base = 'flex items-center justify-between gap-2 transition-all select-none cursor-pointer font-manrope';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    if (variant === 'underline') {
      return `${base} bg-transparent border-b border-[var(--border-color)] hover:border-[var(--gold)] focus:border-[var(--gold)] text-[var(--text-primary)] ${
        size === 'sm' ? 'py-1 text-[12.5px]' : 'py-1.5 text-[13.5px]'
      } ${disabledClass} ${buttonClassName}`;
    }

    if (variant === 'bordered') {
      return `${base} bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] rounded-none ${
        size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[13px]'
      } ${disabledClass} ${buttonClassName}`;
    }

    // default
    return `${base} bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-primary)] rounded-none ${
      size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3.5 py-1.5 text-[13px]'
    } ${disabledClass} ${buttonClassName}`;
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={getTriggerClasses()}
      >
        <span className="truncate font-medium text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--gold)]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 z-50 mt-1 min-w-full w-max max-w-[280px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
          style={{
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.45), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between gap-3 px-3 py-2 text-[12.5px] font-manrope cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--gold)]/15 text-[var(--gold)] font-semibold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--gold)]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={13} className="shrink-0 text-[var(--gold)]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
