"use client"; // Add this directive at the very top

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useState } from "react";

const DropdownButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { setTheme } = useTheme();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        title="Toggle dropdown"
      >
        <SunIcon className="h-7 w-7" />
      </button>


      {isOpen && (
        <div className="absolute flex flex-col space-y-2 mt-3 pl-1 pt-4 pb-4 pr-4 rounded-lg bg-white text-sm shadow-[0px_0px_15px_0px_rgba(0,0,0,0.50)]">

          <button
            onClick={() => setTheme("dark")}
            title="Switch to dark theme"
            className="flex items-center space-x-2"
          >
            <MoonIcon className="h-7 w-7 text-blue-950" />
         <span className="text-blue-950">Dark</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            title="Switch to system theme"
            className="flex items-center space-x-2"
          >
            <SunIcon className="h-7 w-7 text-blue-950" />
            <span className="text-blue-950">Light</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
