"use client";

export default function OutputBox({ output }: { output: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
      <h2 className="text-lg font-semibold text-[#4A4A8D]">AI Output</h2>
      <p className="mt-4 text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
        {output}
      </p>
    </div>
  );
}

