import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="felx items-center space-x-5">
        <Link href="/">
          <Image
            className="w-44 object-contain cursor-pointer"
            src="https://miro.medium.com/max/8978/1*s986xIGqhfsN8U--09_AdA.png"
            alt="Medium clone"
            layout="fill"
          />
        </Link>
        <div className="hidden md:inline-flex items-center space-x-5"></div>
      </div>
    </header>
  );
};

export default Header;
