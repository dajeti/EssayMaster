"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import Profile from "../Components/Profile";

const NavigationBar = () => {
  const currentPath = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const HomePage = () => {
  }


  return (
    <ThemeProvider attribute="class">
      <nav className="grid h-20 grid-cols-1 flex-col items-center justify-center md:h-24">
        <div
          className={`ml-28 hidden flex-wrap justify-center space-x-10 p-2 text-lg text-[#01243d] opacity-100 dark:text-white md:flex lg:space-x-20 md:ml-20`}
        >

          <span
            className={`hover:underline ${currentPath === "/" ? "font-bold underline" : ""
              }`}
          >
            <Link className="text-white" href="/">Home</Link>
          </span>
          <span
            className={`hover:underline ${currentPath === "/about" ? "font-bold underline" : ""
              }`}
          >
            <Link className="text-white" href="/about">About</Link>
          </span>
          <span
            className={`hover:underline ${currentPath === "/faq" ? "font-bold underline" : ""
              }`}
          >
            <Link className="text-white" href="/faq">FAQ</Link>
          </span>
          <span>
            {/* Use the Profile component */}
            <Profile />
          </span>
          <div className="flex gap-10 pt-7 md:pt-9"></div>

        </div>
      </nav>
    </ThemeProvider>
  );
};

export default NavigationBar;
