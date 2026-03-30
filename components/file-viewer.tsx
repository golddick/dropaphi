// // components/file-viewer.tsx
// "use client";

// import { useState, useEffect } from "react";

// interface FileViewerProps {
//   fileUrl: string;
//   mimeType: string;
//   fileName: string;
//   fileType: {
//     isImage: boolean;
//     isPdf: boolean;
//     isText: boolean;
//     isDocument: boolean;
//     isArchive: boolean;
//   };
// }

// export function FileViewer({ fileUrl, mimeType, fileName, fileType }: FileViewerProps) {
//   const [textContent, setTextContent] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Load text content for text files
//   useEffect(() => {
//     if (fileType.isText) {
//       setIsLoading(true);
//       fetch(fileUrl)
//         .then(async (res) => {
//           if (!res.ok) throw new Error("Failed to load file");
//           const text = await res.text();
//           setTextContent(text);
//         })
//         .catch((err) => {
//           setError(err.message);
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
//     }
//   }, [fileUrl, fileType.isText]);

//   // Image viewer
//   if (fileType.isImage) {
//     return (
//       <div className="flex items-center justify-center p-8 bg-gray-50">
//         <img
//           src={fileUrl}
//           alt={fileName}
//           className="max-w-full h-auto rounded-lg shadow-lg"
//           style={{ maxHeight: "80vh" }}
//         />
//       </div>
//     );
//   }

//   // PDF viewer
//   if (fileType.isPdf) {
//     return (
//       <div className="w-full h-[80vh]">
//         <iframe
//           src={`${fileUrl}#toolbar=0`}
//           className="w-full h-full"
//           title={fileName}
//         />
//       </div>
//     );
//   }

//   // Text viewer
//   if (fileType.isText) {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center p-12">
//           <div className="text-gray-500">Loading file content...</div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="flex items-center justify-center p-12">
//           <div className="text-red-500">Error loading file: {error}</div>
//         </div>
//       );
//     }

//     return (
//       <div className="p-6 bg-gray-50">
//         <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-[70vh]">
//           {textContent}
//         </pre>
//       </div>
//     );
//   }

//   // Document viewer (Word, Excel, PowerPoint) - use Google Docs Viewer
//   if (fileType.isDocument) {
//     const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    
//     return (
//       <div className="w-full h-[80vh]">
//         <iframe
//           src={googleDocsUrl}
//           className="w-full h-full"
//           title={fileName}
//         />
//       </div>
//     );
//   }

//   // Archive files and other types
//   return (
//     <div className="flex flex-col items-center justify-center p-12 bg-gray-50">
//       <svg
//         className="h-24 w-24 text-gray-400 mb-4"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={1.5}
//           d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//         />
//       </svg>
//       <h3 className="text-lg font-medium text-gray-900 mb-2">
//         File Preview Not Available
//       </h3>
//       <p className="text-gray-500 text-center mb-4">
//         This file type ({mimeType}) cannot be previewed directly.
//       </p>
//       <a
//         href={fileUrl}
//         download={fileName}
//         className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//       >
//         <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//         </svg>
//         Download File
//       </a>
//     </div>
//   );
// }