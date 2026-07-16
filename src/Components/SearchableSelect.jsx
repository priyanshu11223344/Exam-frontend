import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

const normalizeOption = (option) => {
  if (Array.isArray(option)) {
    return { value: option[0], label: option[1] ?? option[0] };
  }

  if (typeof option === "object" && option !== null) {
    return {
      value: option.value ?? option._id ?? option.name ?? "",
      label: option.label ?? option.name ?? option.value ?? "",
    };
  }

  return { value: option, label: option };
};

const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  emptyOption,
  className = "",
  disabled = false,
  size = "default",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    const baseOptions = options.map(normalizeOption).filter((option) => option.label !== "");
    return emptyOption ? [normalizeOption(emptyOption), ...baseOptions] : baseOptions;
  }, [emptyOption, options]);

  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  const filteredOptions = normalizedOptions.filter((option) =>
    String(option.label).toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  const compact = size === "compact";

  return (
    <label ref={wrapperRef} className={`relative block space-y-1 ${className}`}>
      {label && <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white text-left text-sm text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          compact ? "p-2 shadow-none" : "p-3 shadow-sm"
        }`}
      >
        <span className={selectedOption ? "truncate" : "truncate text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-sm font-semibold text-slate-500">No options found</div>
            )}
            {filteredOptions.map((option) => {
              const selected = String(option.value) === String(value);
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold transition ${
                    selected ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <Check size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </label>
  );
};

export default SearchableSelect;
