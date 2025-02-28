"use client";


import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { ComputerDesktopIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import { useState } from "react";

const DropdownButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const themeIcon = () => {
    switch (theme?.toLowerCase()) {
      case "system":
        return (
          <ComputerDesktopIcon className="h-6 w-6 cursor-pointer dark:text-white" />
        );
      case "light":
        return (
          <SunIcon className="h-6 w-6 cursor-pointer dark:text-white" />
        );
      case "dark":
        return (
          <MoonIcon className="h-6 w-6 cursor-pointer  dark:text-white" />
        );
      case undefined:
        return (
          <ComputerDesktopIcon className="h-6 w-6 cursor-pointer dark:text-white" />
        );
    }
  };

  const toggleTheme = (theme: string) => {
    // Update the theme state
    setTheme(theme);
    setIsOpen(false); // Close the dropdown after selecting a theme
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed left-0 top-0 z-[125] h-screen w-screen"
          onClick={toggleDropdown}
        />
      )}

      <div className={`  ${isOpen ? "z-[150]" : "z-[101]"}  md:top-8 `}>
        <div className="relative text-left">
          <button
            className=" rounded-full  text-black"
            onClick={toggleDropdown}
          >
            {themeIcon()}
          </button>

          {isOpen && (
            <div className="absolute -left-9 mt-9 flex rounded-lg bg-white text-sm shadow-[0px_0px_15px_0px_rgba(0,0,0,0.50)] dark:border dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:shadow-none">
              <ul className="p-1">
                <li
                  className="flex cursor-pointer rounded p-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => toggleTheme("light")} // Light mode
                >
                  <SunIcon className="mr-1 h-5 text-black dark:text-white" />
                  Light
                </li>

                <li
                  className="flex cursor-pointer rounded p-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => toggleTheme("dark")} // Dark mode
                >
                  <MoonIcon className="mr-1 h-5 text-black dark:text-white" />
                  Dark
                </li>

                <li
                  className="flex cursor-pointer rounded p-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => toggleTheme("system")} // Dark mode
                >
                  <ComputerDesktopIcon className="mr-1 h-5 text-black dark:text-white" />
                  System
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DropdownButton;
