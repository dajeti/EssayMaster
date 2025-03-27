// "use client";

// import { useState, useEffect, useRef } from "react";
// import LoadingModal from "./LoadingModal";
// import * as pdfjsLib from "pdfjs-dist";
// import TabsPanel from "./TabsPanel"; 
// import { useDebounce } from "use-debounce";
// import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

// pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// export default function EssayForm({ sessionId }: { sessionId: string }) {
//   const [essay, setEssay] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [markSchemeUrl, setMarkSchemeUrl] = useState("");
//   const [notification, setNotification] = useState({ show: false, message: "" });
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [debouncedEssay] = useDebounce(essay, 2000); // Auto-save every 2 sec

//   useEffect(() => {
//     // Initial load of session data
//     async function loadSession() {
//       setIsLoading(true);
//       try {
//         // Get essay content
//         const essayRes = await fetch(`/api/essays/${sessionId}`);
//         if (essayRes.ok) {
//           const essayData = await essayRes.json();
//           setEssay(essayData.essay || "");
//         }
        
//         // Get mark scheme if exists
//         const markRes = await fetch(`/api/marks/${sessionId}`);
//         if (markRes.ok) {
//           const markData = await markRes.json();
//           if (markData.markScheme) {
//             setMarkSchemeUrl(markData.markScheme.fileUrl);
//           }
//         }
//       } catch (error) {
//         console.error("Error loading session data:", error);
//         showNotification("Failed to load session data");
//       } finally {
//         setIsLoading(false);
//       }
//     }
    
//     loadSession();
//   }, [sessionId]);

//   // Auto-save essay when it changes (debounced)
//   useEffect(() => {
//     if (debouncedEssay) {
//       saveEssay(debouncedEssay);
//     }
//   }, [debouncedEssay]);

//   const saveEssay = async (newEssay: string) => {
//     try {
//       const res = await fetch(`/api/essays/${sessionId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ essay: newEssay }),
//       });
      
//       if (!res.ok) {
//         console.error("Failed to save essay");
//       }
//     } catch (error) {
//       console.error("Error saving essay:", error);
//     }
//   };

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
    
//     // Only accept PDF files
//     if (file.type !== "application/pdf") {
//       showNotification("Please upload a PDF file");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       // Upload the file
//       const formData = new FormData();
//       formData.append("file", file);
      
//       const uploadRes = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });
      
//       if (!uploadRes.ok) {
//         throw new Error("File upload failed");
//       }
      
//       const uploadData = await uploadRes.json();
      
//       // Save the mark scheme
//       await fetch(`/api/marks/${sessionId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fileUrl: uploadData.url }),
//       });
      
//       setMarkSchemeUrl(uploadData.url);
//       showNotification("Mark scheme uploaded successfully");
//     } catch (error) {
//       console.error("Error uploading mark scheme:", error);
//       showNotification("Failed to upload mark scheme");
//     } finally {
//       setIsLoading(false);
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const showNotification = (message: string) => {
//     setNotification({ show: true, message });
//     setTimeout(() => {
//       setNotification({ show: false, message: "" });
//     }, 3000);
//   };

//   return (
//     <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
//       <LoadingModal isLoading={isLoading} />
      
//       {/* Notification */}
//       {notification.show && (
//         <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
//           {notification.message}
//         </div>
//       )}

//       {/* Top Bar - Mark Scheme Upload */}
//       <div className="px-4 pb-2 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold">Essay Master</h1>
          
//           <div className="flex items-center">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileUpload}
//               className="hidden"
//               accept="application/pdf"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-blue-100 text-blue-700 px-3 py-1 rounded flex items-center"
//             >
//               <DocumentArrowUpIcon className="w-5 h-5 mr-1" />
//               {markSchemeUrl ? "Change Mark Scheme" : "Upload Mark Scheme"}
//             </button>
            
//             {markSchemeUrl && (
//               <a
//                 href={markSchemeUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="ml-3 text-blue-600 hover:underline"
//               >
//                 View Mark Scheme
//               </a>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Layout */}
//       <div className="flex flex-1 h-full overflow-hidden">
//         {/* Essay Editor */}
//         <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
//           <h2 className="text-xl font-bold text-gray-700 mb-3">Your Essay</h2>
//           <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto">
//             <textarea
//               className="w-full h-full bg-transparent focus:outline-none text-base text-gray-700"
//               placeholder="Paste or type your essay here..."
//               value={essay}
//               onChange={(e) => setEssay(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Chat & Feedback */}
//         <div className="w-1/3 bg-white p-4 flex flex-col">
//           <TabsPanel sessionId={sessionId} essay={essay} />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel from "./TabsPanel"; 
import { useDebounce } from "use-debounce";

// Must point to your own worker path if needed
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm({ sessionId }: { sessionId: string }) {
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [debouncedEssay] = useDebounce(essay, 2000);

  useEffect(() => {
    // Load existing essay from backend
    async function loadSession() {
      setIsLoading(true);
      try {
        const essayRes = await fetch(`/api/essays/${sessionId}`);
        if (essayRes.ok) {
          const essayData = await essayRes.json();
          setEssay(essayData.essay || "");
        } else {
          console.error("Failed to load essay from session:", await essayRes.text());
        }
      } catch (error) {
        console.error("Error loading session data:", error);
        showNotification("Failed to load essay data");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  // Auto-save the essay
  useEffect(() => {
    if (debouncedEssay) {
      saveEssay(debouncedEssay);
    }
  }, [debouncedEssay]);

  const saveEssay = async (newEssay: string) => {
    try {
      const res = await fetch(`/api/essays/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: newEssay }),
      });
      if (!res.ok) {
        console.error("Failed to save essay");
      }
    } catch (error) {
      console.error("Error saving essay:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification.message}
        </div>
      )}

      {/* Page Layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Essay Editor (Left) */}
        <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Your Essay</h2>
          <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto">
            <textarea
              className="w-full h-full bg-transparent focus:outline-none text-base text-gray-700"
              placeholder="Paste or type your essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs: Feedback / Chat */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          <TabsPanel sessionId={sessionId} essay={essay} />
        </div>
      </div>
    </div>
  );
}
