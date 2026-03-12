import { useState } from "react";

export default function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-transparent transition ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-transparent transition bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-transparent transition resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
}

export function SearchSelect({
  options = [],
  value,
  onChange,
  placeholder = "Search...",
  getLabel = (o) => o.label,
  getValue = (o) => o.value,
  open,
  setOpen
}) {

  const [search, setSearch] = useState("");

  const selected = options.find(o => getValue(o) === value);

  const filtered = options.filter(o =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        value={open ? search : (selected ? getLabel(selected) : "")}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-transparent transition"
      />

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow max-h-40 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((o) => (
              <div
                key={getValue(o)}
                onMouseDown={() => {
                  onChange(getValue(o));
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {getLabel(o)}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}