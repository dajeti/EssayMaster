import React from 'react';
import Image from 'next/image';
import Navigation from './Navigation';
import DropdownButton from './DropdownButton';
import { ThemeProvider } from "next-themes";

const Header = () => {
  return (
    <ThemeProvider attribute="class">
    <div className="fixed top-0 z-[100] h-20 w-full flex justify-between border-b border-gray-300 bg-blue-custom dark:bg-blue-custom-dark px-5 md:px-[8rem] lg:px-[15rem]">
      <div className="z-[101] flex items-center">

        <Image 
          src="/favicon.ico" 
          alt="Logo" 
          width={60} 
          height={60} 
          className="h-15 w-15 rounded-md"
        />
      </div>

      <Navigation />
      
      <div className="flex pl-16 pt-3 md:pt-3">
      <DropdownButton />
        
      </div>
    </div>
    </ThemeProvider>
  );
};

export default Header;
