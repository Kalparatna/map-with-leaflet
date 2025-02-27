import React from "react";

const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-6 py-3 text-lg font-medium rounded-lg text-white transition-all transform hover:scale-105 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
