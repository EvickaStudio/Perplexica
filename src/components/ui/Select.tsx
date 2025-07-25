import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, useState, useRef, useEffect } from 'react';

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: { value: string; label: string; disabled?: boolean }[];
  onChange?: (e: { target: { value: string } }) => void;
}

export const Select = ({
  className,
  options,
  onChange,
  value,
  ...restProps
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange?.({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={cn(
          'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center justify-between border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm cursor-pointer min-h-[40px]',
          className,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : 'Select an option'}
        </span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen ? 'rotate-180' : '',
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-light-200 dark:border-dark-200">
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-light-200 dark:bg-dark-200 border border-light-200 dark:border-dark-200 rounded text-black dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(({ label, value, disabled }) => (
                <div
                  key={value}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer hover:bg-light-200 dark:hover:bg-dark-200 text-black dark:text-white',
                    disabled && 'opacity-50 cursor-not-allowed',
                    value === selectedOption?.value &&
                      'bg-light-200 dark:bg-dark-200',
                  )}
                  onClick={() => !disabled && handleOptionClick(value)}
                >
                  {label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-black/60 dark:text-white/60">
                No models found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
