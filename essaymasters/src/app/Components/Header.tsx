import React from 'react';
import Image from 'next/image';
import Navigation from './Navigation';
import DropdownButton from './DropdownButton';

const Header = () => {
  return (
    <div className="fixed top-0 z-[100] h-20 w-full flex justify-between border-b border-gray-300 bg-blue-custom px-5 md:px-[8rem] lg:px-[15rem]">
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
  );
};

export default Header;
