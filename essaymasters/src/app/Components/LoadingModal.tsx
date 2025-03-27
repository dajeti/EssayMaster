import { useState } from "react";

export default function LoadingModal({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold text-[#4A4A8D]">Processing...</h2>
        <p className="text-gray-700 mt-2">This might take a few seconds.</p>
        {/* Optional Progress Bar */}
        <div className="w-full bg-gray-300 mt-4 h-2 rounded-full overflow-hidden">
          <div className="h-2 bg-indigo-500 progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
