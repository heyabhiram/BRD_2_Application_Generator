"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Screen1BRDInput } from "@/components/Screen1BRDInput";
import { Screen2ArchitectureEditor } from "@/components/Screen2ArchitectureEditor";
import { Screen3ApplicationPreview } from "@/components/Screen3ApplicationPreview";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [brdText, setBrdText] = useState<string>("");
  const [architectureMarkdown, setArchitectureMarkdown] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");

  const [isLoadingArch, setIsLoadingArch] = useState<boolean>(false);
  const [isRefiningArch, setIsRefiningArch] = useState<boolean>(false);
  const [isStartingGen, setIsStartingGen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Screen 1: Generate Architecture
  const handleGenerateArchitecture = async (inputBrd: string) => {
    setIsLoadingArch(true);
    setErrorMessage(null);
    setBrdText(inputBrd);

    try {
      const response = await fetch("http://localhost:8000/api/brd/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brd_text: inputBrd }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate architecture");
      }

      const data = await response.json();
      setArchitectureMarkdown(data.architecture);
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while generating architecture.");
    } finally {
      setIsLoadingArch(false);
    }
  };

  // Screen 2: Refine Architecture
  const handleRefineArchitecture = async (instruction: string) => {
    setIsRefiningArch(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:8000/api/brd/refine-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_markdown: architectureMarkdown,
          instruction: instruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to refine architecture");
      }

      const data = await response.json();
      setArchitectureMarkdown(data.architecture);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to refine architecture.");
    } finally {
      setIsRefiningArch(false);
    }
  };

  // Screen 2 -> 3: Approve & Generate
  const handleApproveAndGenerate = async () => {
    setIsStartingGen(true);
    setErrorMessage(null);

    const generatedProjectId = `app_${Date.now().toString(36)}`;
    setProjectId(generatedProjectId);

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: generatedProjectId,
          architecture: architectureMarkdown,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start generation pipeline");
      }

      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start application generation.");
    } finally {
      setIsStartingGen(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      <Header
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
        canNavigateToStep2={Boolean(architectureMarkdown)}
        canNavigateToStep3={Boolean(projectId)}
      />

      {errorMessage && (
        <div className="bg-red-950/70 border-b border-red-800/80 px-6 py-2.5 text-xs text-red-200 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-100 underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {currentStep === 1 && (
          <Screen1BRDInput
            onGenerateArchitecture={handleGenerateArchitecture}
            isLoading={isLoadingArch}
          />
        )}

        {currentStep === 2 && (
          <Screen2ArchitectureEditor
            architectureMarkdown={architectureMarkdown}
            onRefineArchitecture={handleRefineArchitecture}
            onApproveAndGenerate={handleApproveAndGenerate}
            onBack={() => setCurrentStep(1)}
            isRefining={isRefiningArch}
            isStartingGeneration={isStartingGen}
          />
        )}

        {currentStep === 3 && (
          <Screen3ApplicationPreview
            projectId={projectId}
            onBackToArchitecture={() => setCurrentStep(2)}
          />
        )}
      </main>
    </div>
  );
}
