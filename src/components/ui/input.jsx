import React from "react";

const Input = ({ className, ...props }) => {
  return (
    <input
      className={`px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-md bg-white bg-opacity-30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
};

export { Input };
