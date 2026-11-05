import React, { useState, useRef } from "react";
import { UploadCloud, FileText, ArrowRight, Loader2, X, Sparkles } from "lucide-react";

interface Screen1BRDInputProps {
  onGenerateArchitecture: (brdText: string) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_BRD = `# Business Requirement Document (BRD)
## Project: TaskFlow - Internal Task & Milestone Tracker

### 1. Executive Summary
TaskFlow is a centralized project and milestone management tool for agile software engineering teams. It allows managers and developers to track sprints, manage task statuses, assign priorities, and visualize progress.

### 2. Core Functional Requirements
- **Task Management**: Create, update, view, and delete tasks. Each task has: Title, Description, Status (To Do, In Progress, Under Review, Completed), Priority (Low, Medium, High, Critical), Assignee Name, and Due Date.
- **Milestone & Sprint Tracking**: Group tasks under milestones with progress percentage calculation.
- **Dashboard & Metrics**: Overview showing count of tasks by status, high-priority alerts, and upcoming deadlines.
- **Activity & Filtering**: Quick filter by status and priority, text search across titles, and status toggle.

### 3. Non-Functional Requirements
- Fast and responsive dark theme UI.
- Local SQLite database persistence for tasks and milestones.
- RESTful API endpoints for all CRUD operations.
`;

export const Screen1BRDInput: React.FC<Screen1BRDInputProps> = ({
  onGenerateArchitecture,
  isLoading,
}) => {
  const [brdText, setBrdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (selectedFile: File) => {
    setUploadError(null);
    setIsParsing(true);
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/brd/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to parse document");
      }

      const data = await response.json();
      setBrdText(data.text);
    } catch (err: any) {
      setUploadError(err.message || "Error reading file. Please try pasting the text directly.");
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClear = () => {
    setBrdText("");
    setFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadSample = () => {
    setBrdText(SAMPLE_BRD);
    setFile(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brdText.trim() || isLoading) return;
    onGenerateArchitecture(brdText.trim());
  };

  const wordCount = brdText.trim() ? brdText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full mb-3">
          <span>Phase 1</span>
          <span className="text-zinc-600">/</span>
          <span>Requirements Ingestion</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          Upload or Specify Business Requirements
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Provide your project BRD via file upload (PDF, DOCX, TXT) or direct text entry. The copilot will extract and structure the complete technical specification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 rounded-xl p-8 text-center cursor-pointer transition-colors group relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
            {isParsing ? (
              <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
            )}
          </div>

          <p className="text-sm font-medium text-zinc-200">
            {file ? file.name : "Click to upload document or drag and drop"}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Supports PDF, DOCX, TXT, and Markdown files
          </p>

          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {uploadError && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 text-xs text-red-300">
            {uploadError}
          </div>
        )}

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Document Text / Requirements Specification
            </label>
            <div className="flex items-center space-x-3 text-xs">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample BRD</span>
              </button>
              {brdText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            value={brdText}
            onChange={(e) => setBrdText(e.target.value)}
            rows={12}
            placeholder="Paste raw business requirement text, product specification, user stories, or schema requirements here..."
            className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-lg p-4 text-sm text-zinc-100 placeholder-zinc-600 font-mono resize-y outline-none transition-colors"
          />

          <div className="flex justify-between items-center text-xs text-zinc-400 pt-1">
            <span>
              {wordCount > 0 ? `${wordCount} words (${brdText.length} characters)` : "Empty"}
            </span>
            <span>Markdown supported</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!brdText.trim() || isLoading}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !brdText.trim() || isLoading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                : "bg-zinc-100 text-zinc-900 hover:bg-white shadow-md active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                <span>Analyzing & Generating Architecture...</span>
              </>
            ) : (
              <>
                <span>Generate Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

