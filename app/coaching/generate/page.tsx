"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Download } from "lucide-react";
import type { Agent } from "@/types";

export default function GenerateCoachingPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [transcript, setTranscript] = useState("");
  const [observations, setObservations] = useState("");
  const [callType, setCallType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data));
  }, []);

  const handleGenerate = async () => {
    if (!selectedAgent) {
      alert("Please select an agent");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/coaching/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent,
          transcript,
          observations,
          callType,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedContent(data.content);
      } else {
        alert(data.error || "Failed to generate coaching material");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate coaching material");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coaching-${selectedAgent}-${Date.now()}.md`;
    a.click();
  };

  return (
    <AppLayout
      title="AI Coaching Generator"
      description="Generate coaching materials powered by AI"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-8">
            Input Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="agent" className="text-[#A4E83C] uppercase tracking-wide font-bold text-xs">
                Select Agent *
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger 
                  id="agent" 
                  className="mt-3 bg-[#2A2A2A] border-white/10 text-white h-12 rounded-xl"
                >
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {agents.map((agent) => (
                    <SelectItem 
                      key={agent.id} 
                      value={agent.id.toString()}
                      className="text-white hover:bg-white/10"
                    >
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="callType" className="text-gray-400 uppercase tracking-wide font-semibold text-xs">
                Call Type (optional)
              </Label>
              <Select value={callType} onValueChange={setCallType}>
                <SelectTrigger 
                  id="callType" 
                  className="mt-3 bg-[#2A2A2A] border-white/10 text-white h-12 rounded-xl"
                >
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  <SelectItem value="cancellation-price" className="text-white hover:bg-white/10">
                    Cancellation - Price Objection
                  </SelectItem>
                  <SelectItem value="cancellation-service" className="text-white hover:bg-white/10">
                    Cancellation - Service Issue
                  </SelectItem>
                  <SelectItem value="renewal" className="text-white hover:bg-white/10">
                    Renewal
                  </SelectItem>
                  <SelectItem value="query" className="text-white hover:bg-white/10">
                    General Query
                  </SelectItem>
                  <SelectItem value="complaint" className="text-white hover:bg-white/10">
                    Complaint
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transcript" className="text-gray-400 uppercase tracking-wide font-semibold text-xs">
                Call Transcript (optional)
              </Label>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="mt-3 w-full min-h-[150px] p-4 bg-[#2A2A2A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A4E83C]/50 focus:border-[#A4E83C]/50 resize-y"
                placeholder="Paste the call transcript here..."
              />
              <p className="text-xs text-gray-500 mt-2 italic">
                Include timestamps if available (e.g., [2:15] agent says...)
              </p>
            </div>

            <div>
              <Label htmlFor="observations" className="text-gray-400 uppercase tracking-wide font-semibold text-xs">
                Manager Observations (optional)
              </Label>
              <textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="mt-3 w-full min-h-[100px] p-4 bg-[#2A2A2A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A4E83C]/50 focus:border-[#A4E83C]/50 resize-y"
                placeholder="Add your observations about the call..."
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAgent}
              className="w-full gap-2 h-14 text-base font-bold uppercase tracking-wide bg-[#A4E83C] text-black hover:bg-[#8FC72D] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Coaching Material
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated Output */}
        <div className="glass-card p-8 shadow-premium animate-fade-scale hover-lift">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
              Generated Coaching Document
            </h2>
            {generatedContent && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownload}
                className="hover-lift"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>

          {!generatedContent && !isGenerating && (
            <div className="flex items-center justify-center h-[500px] text-center">
              <div>
                <Sparkles className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                <p className="text-base text-gray-400 font-semibold uppercase tracking-wide">
                  Fill in the form and click generate
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  AI will create a structured coaching document
                </p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-[#A4E83C]" />
                <p className="text-lg text-white font-semibold uppercase tracking-wide mb-2">
                  Analyzing and generating...
                </p>
                <p className="text-sm text-gray-400">This may take a few moments</p>
              </div>
            </div>
          )}

          {generatedContent && (
            <div className="animate-fade-scale">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[500px] max-h-[600px] overflow-y-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
                  {generatedContent}
                </pre>
              </div>
              
              <div className="mt-6 p-4 bg-[#A4E83C]/10 border border-[#A4E83C]/30 rounded-xl">
                <p className="text-xs text-[#A4E83C] uppercase tracking-wide font-semibold">
                  ✓ Document generated successfully
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Review the coaching material above and download when ready
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(164, 232, 60, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(164, 232, 60, 0.5);
        }
      `}</style>
    </AppLayout>
  );
}
