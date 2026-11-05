import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, CheckCircle2, ArrowLeft, Loader2, Sparkles, Layers } from "lucide-react";

interface Screen2ArchitectureEditorProps {
  architectureMarkdown: string;
  onRefineArchitecture: (instruction: string) => Promise<void>;
  onApproveAndGenerate: () => void;
  onBack: () => void;
  isRefining: boolean;
  isStartingGeneration: boolean;
}

export const Screen2ArchitectureEditor: React.FC<Screen2ArchitectureEditorProps> = ({
  architectureMarkdown,
  onRefineArchitecture,
  onApproveAndGenerate,
  onBack,
  isRefining,
  isStartingGeneration,
}) => {
  const [instruction, setInstruction] = useState("");

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefineArchitecture(instruction.trim());
    setInstruction("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-zinc-950 text-zinc-100 relative">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to BRD</span>
          </button>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-200">
              Functional & System Specification Document
            </h2>
          </div>
        </div>

        {/* Top Right Action: Approve & Generate */}
        <button
          type="button"
          onClick={onApproveAndGenerate}
          disabled={isStartingGeneration || isRefining}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            isStartingGeneration || isRefining
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95 shadow-sm"
          }`}
        >
          {isStartingGeneration ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Initializing Multi-Agent Pipeline...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
              <span>Approve & Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Main Scrollable Document Viewer */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 max-w-5xl mx-auto w-full">
        {isRefining && (
          <div className="sticky top-0 z-20 mb-6 bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-3.5 flex items-center space-x-3 backdrop-blur shadow-lg">
            <Loader2 className="w-4 h-4 text-zinc-200 animate-spin" />
            <span className="text-xs text-zinc-200 font-medium">
              Updating Functional Specification with your suggestions...
            </span>
          </div>
        )}

        <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-8 sm:p-12 shadow-sm">
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {architectureMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Bottom Centered Chat Input */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-30">
        <form
          onSubmit={handleSendPrompt}
          className="w-full max-w-2xl bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl p-1.5 flex items-center space-x-2 pointer-events-auto backdrop-blur-md"
        >
          <div className="pl-3 pr-1 text-zinc-500">
            <Sparkles className="w-4 h-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRefining}
            placeholder="Suggest revisions to the architecture (e.g., 'Add user role management with SQLite schema updates')..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none px-1 py-2 font-sans"
          />
          <button
            type="submit"
            disabled={!instruction.trim() || isRefining}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              !instruction.trim() || isRefining
                ? "text-zinc-600 bg-zinc-800/50 cursor-not-allowed"
                : "bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95 shadow"
            }`}
          >
            {isRefining ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

