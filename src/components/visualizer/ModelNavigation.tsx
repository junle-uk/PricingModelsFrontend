"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const models = [
  { name: "Black-Scholes", path: "/", description: "Analytical formula" },
  { name: "Binomial", path: "/binomial", description: "Lattice model" },
  { name: "Monte Carlo", path: "/monte-carlo", description: "Simulation" },
];

export function ModelNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentModel = models.find(m => m.path === pathname) || models[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 border border-[#1a1a1a] bg-[#0a0a0a] text-[#00ff00] hover:border-[#00ff00] text-xs uppercase tracking-wider transition-colors"
      >
        <span>MODEL: {currentModel.name.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-20 min-w-[220px] border border-[#1a1a1a] bg-[#0a0a0a] shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {models.map((model) => (
            <Link
              key={model.path}
              href={model.path}
              prefetch={true}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 text-xs uppercase tracking-wider transition-all ${
                pathname === model.path
                  ? "bg-[#1a1a1a] text-[#00ff00] border-l-2 border-[#00ff00]"
                  : "text-[#666666] hover:bg-[#1a1a1a] hover:text-[#00ff00] hover:border-l-2 hover:border-[#00ff00]"
              }`}
            >
              <div className="font-bold">{model.name}</div>
              <div className="text-[10px] text-[#555555] mt-0.5">{model.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

