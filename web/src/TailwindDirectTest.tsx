import React from 'react';

// This component uses direct inline styles that match Tailwind's utility classes
// We'll use this to compare with our Tailwind component
const TailwindDirectTest = () => {
  return (
    <div className="fixed top-20 right-5 z-50 bg-white p-4 border border-gray-200 rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-2">
        Direct Style Test
      </h2>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-full bg-red-500"></div>
        <div className="h-4 w-full bg-orange-500"></div>
        <div className="h-4 w-full bg-yellow-500"></div>
        <div className="h-4 w-full bg-green-500"></div>
        <div className="h-4 w-full bg-blue-500"></div>
        <div className="h-4 w-full bg-indigo-500"></div>
        <div className="h-4 w-full bg-purple-500"></div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        This box uses direct inline styles
      </p>
    </div>
  );
};

export default TailwindDirectTest;
