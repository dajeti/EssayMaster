import { useRef } from 'react';

interface UploadMarkSchemeProps {
  markSchemeUrl: string;
  isLoading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export const UploadMarkScheme = ({
  markSchemeUrl,
  isLoading,
  onUpload,
}: UploadMarkSchemeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
        disabled={isLoading}
      >
        {markSchemeUrl ? "Change Mark Scheme" : "Upload Mark Scheme"}
      </button>
      {markSchemeUrl && (
        <a
          href={markSchemeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 text-blue-600 hover:underline"
        >
          View Mark Scheme
        </a>
      )}
    </div>
  );
};