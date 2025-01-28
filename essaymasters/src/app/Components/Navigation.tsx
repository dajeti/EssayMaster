"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { UserCircleIcon } from "@heroicons/react/24/outline";

const NavigationBar = () => {
  const currentPath = usePathname(); 

  return (
    <nav className="grid h-20 grid-cols-1 flex-col items-center justify-center md:h-24">
      <div
        className={`ml-28 hidden flex-wrap justify-center space-x-10 p-2 text-lg text-[#01243d] opacity-100 dark:text-white md:flex lg:space-x-20 md:ml-20`}
      >
        
        
        <span
          className={`hover:underline ${
            currentPath === "/" ? "font-bold underline" : ""
          }`}
        >
          <Link href="/">Home</Link>
        </span>
        <span
          className={`hover:underline ${
            currentPath === "/about" ? "font-bold underline" : ""
          }`}
        >
          <Link href="/about">About</Link>
        </span>
        <span
          className={`hover:underline ${
            currentPath === "/faq" ? "font-bold underline" : ""
          }`}
        >
          <Link href="/faq">FAQ</Link>
        </span>
 
        <UserCircleIcon className="h-7 w-7 hover:cursor-pointer hover:text-blue-950 hover:shadow-lg left-32" />
      
        <div className="flex gap-10 pt-7 md:pt-9"></div>
      </div>
    </nav>
  );
};

export default NavigationBar;
