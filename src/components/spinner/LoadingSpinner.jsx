import React from "react";

const LoadingSpinner = ({ message = "Betöltés..." }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">{message}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
