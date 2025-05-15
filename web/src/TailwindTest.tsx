import React from 'react';

const TailwindTest = () => {
  return (
    <div className="fixed top-5 right-5 z-50 debug-box">
      <h2 className="text-2xl text-blue-600 font-bold mb-2">Tailwind Test</h2>
      <div className="space-y-2">
        <div className="h-4 w-full bg-red-500"></div>
        <div className="h-4 w-full bg-orange-500"></div>
        <div className="h-4 w-full bg-yellow-500"></div>
        <div className="h-4 w-full bg-green-500"></div>
        <div className="h-4 w-full bg-blue-500"></div>
        <div className="h-4 w-full bg-indigo-500"></div>
        <div className="h-4 w-full bg-purple-500"></div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        If you can see this box with colored bars, Tailwind is working!
      </p>
    </div>
  );
};

export default TailwindTest;
