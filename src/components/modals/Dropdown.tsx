import { useEffect, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: (string | Option)[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder = 'Select...' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const opts: Option[] = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const current = opts.find((o) => o.value === value);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      <div
        className={`cs-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
      >
        <span className="cs-label">{current ? current.label : placeholder}</span>
        <svg className="cs-arrow" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={`cs-options ${open ? 'show' : ''}`}>
        {opts.map((o) => (
          <div
            key={o.value}
            className={`cs-option ${o.value === value ? 'selected' : ''}`}
            onClick={() => {
              onChange(o.value);
              setOpen(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}
