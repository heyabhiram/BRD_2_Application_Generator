import React, { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  RefreshCw,
  Send,
  Terminal,
  Cpu,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Database,
  ShieldCheck,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";

interface Screen3ApplicationPreviewProps {
  projectId: string;
  onBackToArchitecture: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

export const Screen3ApplicationPreview: React.FC<Screen3ApplicationPreviewProps> = ({
  projectId,
  onBackToArchitecture,
}) => {
  const [status, setStatus] = useState<string>("in_progress");
  const [step, setStep] = useState<string>("planning");
  const [logs, setLogs] = useState<string[]>([]);
  const [port, setPort] = useState<number | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [chatInstruction, setChatInstruction] = useState<string>("");
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState<boolean>(true);
  
  // In-memory conversational list for the modifier panel
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Application is active. You can request feature additions, component changes, data adjustments, or theme customizations (e.g. 'switch to light theme', 'make background navy blue', 'add priority filter').",
      time: "Ready",
    },
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Auto-scroll modifier chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isModifying]);

  // Connect to SSE stream or poll generation status
  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(
      `http://localhost:8000/api/generation/stream/${projectId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) setStatus(data.status);
        if (data.step) setStep(data.step);
        if (data.port) setPort(data.port);
        if (data.new_logs && data.new_logs.length > 0) {
          setLogs((prev) => [...prev, ...data.new_logs]);
        }
        if (data.status === "ready" || data.status === "error") {
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE payload", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Fallback polling once
      fetch(`http://localhost:8000/api/generation/status/${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status) setStatus(data.status);
          if (data.step) setStep(data.step);
          if (data.port) setPort(data.port);
          if (data.logs) setLogs(data.logs);
        })
        .catch(() => {});
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  const handleRefreshPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleSendModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInstruction.trim() || isModifying) return;

    const instruction = chatInstruction.trim();
    setChatInstruction("");
    setIsModifying(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: instruction,
      time: timeStr,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:8000/api/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          instruction: instruction,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to apply modification");
      }

      const result = await res.json();
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: result.message || "Modifications applied successfully and verified.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, replyMsg]);

      // Delay refresh slightly for Next.js hot-reload to catch up
      setTimeout(() => {
        handleRefreshPreview();
      }, 1000);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: `Error: ${err.message || "Failed to apply modification"}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsModifying(false);
    }
  };

  const agentSteps = [
    { id: "planning", label: "Planner Agent", icon: Layers, desc: "Project scaffolding & task division" },
    { id: "backend", label: "Backend Agent", icon: Database, desc: "SQLite schema, queries & API routes" },
    { id: "frontend", label: "Frontend Agent", icon: Code2, desc: "Next.js pages & Tailwind UI components" },
    { id: "qa", label: "Integration / QA Agent", icon: ShieldCheck, desc: "Build verification & self-healing" },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ["planning", "backend", "frontend", "qa", "ready"];
    const currentIdx = order.indexOf(step);
    const targetIdx = order.indexOf(stepId);

    if (status === "ready") return "completed";
    if (currentIdx > targetIdx) return "completed";
    if (currentIdx === targetIdx) return "active";
    return "pending";
  };

  const previewUrl = port ? `http://localhost:${port}` : null;

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sub-header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-zinc-300">Project ID:</span>
          <code className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
            {projectId}
          </code>
          {port && (
            <div className="flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>localhost:{port}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {previewUrl && (
            <>
              <button
                type="button"
                onClick={handleRefreshPreview}
                className="flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
            className="flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            {isChatPanelOpen ? (
              <>
                <span>Hide Changes Panel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Modify App</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center View: Loading / Pipeline Status OR Live Application Iframe */}
        <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
          {status !== "ready" ? (
            /* Loading & Multi-Agent Pipeline Execution Screen */
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full flex flex-col justify-center">
              <div className="mb-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-6 h-6 text-zinc-300 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100">
                  Multi-Agent Generation Pipeline in Progress
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Autonomous agents are constructing your full-stack Next.js + SQLite application.
                </p>
              </div>

              {/* Agent Progress Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {agentSteps.map((agent) => {
                  const s = getStepStatus(agent.id);
                  const Icon = agent.icon;
                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-xl border transition-all ${
                        s === "active"
                          ? "bg-zinc-900 border-zinc-700 shadow-md ring-1 ring-zinc-700"
                          : s === "completed"
                          ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-300"
                          : "bg-zinc-950 border-zinc-900 text-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${s === "active" ? "text-zinc-100" : s === "completed" ? "text-zinc-400" : "text-zinc-600"}`} />
                          <span className="text-xs font-semibold">{agent.label}</span>
                        </div>
                        {s === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : s === "active" ? (
                          <Loader2 className="w-4 h-4 text-zinc-200 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {agent.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs Stream */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-300">Agent Pipeline Event Stream</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">Live</span>
                </div>
                <div className="p-4 font-mono text-xs text-zinc-300 h-64 overflow-y-auto space-y-1.5">
                  {logs.length === 0 ? (
                    <div className="text-zinc-600">Waiting for agent activity...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex space-x-2">
                        <span className="text-zinc-600 select-none">&gt;</span>
                        <span className={log.includes("Error") ? "text-red-400" : "text-zinc-300"}>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          ) : (
            /* Live Running Application Iframe */
            <div className="flex-1 w-full h-full bg-black relative">
              {previewUrl ? (
                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Generated Application Live Preview"
                  className="w-full h-full border-0 bg-zinc-950"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  Connecting to application subprocess...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right-Side Chat Panel for Iterative Modifications & Theme Updates */}
        {isChatPanelOpen && (
          <div className="w-80 sm:w-96 border-l border-zinc-800 bg-zinc-900/70 flex flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Application Modifier
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Features, Theme Customization & Updates
                </p>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-tr-none shadow-sm"
                        : "bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">
                    {msg.role === "user" ? "You" : "Modifier Agent"} · {msg.time}
                  </span>
                </div>
              ))}

              {isModifying && (
                <div className="flex flex-col items-start">
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl rounded-tl-none px-3 py-2 text-xs text-zinc-400 flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                    <span>Applying changes & verifying build...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Modification Input Form */}
            <form onSubmit={handleSendModification} className="p-3 border-t border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-xl px-3 py-1.5">
                <input
                  type="text"
                  value={chatInstruction}
                  onChange={(e) => setChatInstruction(e.target.value)}
                  disabled={isModifying || status !== "ready"}
                  placeholder={
                    status !== "ready"
                      ? "Available once application is ready..."
                      : "Request feature, theme change, or fix..."
                  }
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none py-1.5"
                />
                <button
                  type="submit"
                  disabled={!chatInstruction.trim() || isModifying || status !== "ready"}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    !chatInstruction.trim() || isModifying || status !== "ready"
                      ? "text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95 shadow"
                  }`}
                >
                  {isModifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
