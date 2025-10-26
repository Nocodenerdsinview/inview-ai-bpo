"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Upload, Plus, Trash2, Loader2, Download, Clipboard, Info } from "lucide-react";
import { format } from "date-fns";
import { parseClipboardData, readClipboard, getClipboardInstructions } from "@/lib/clipboardParser";
import { matchAgentName } from "@/lib/parsers/nameMatching";

interface Agent {
  id: number;
  name: string;
}

interface BulkKPIRow {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  quality: string;
  aht: string;
  srr: string;
  voc: string;
  errors: string[];
}

export function BulkEntryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [rows, setRows] = useState<BulkKPIRow[]>([createEmptyRow()]);
  const [loading, setLoading] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  function createEmptyRow(): BulkKPIRow {
    return {
      id: Math.random().toString(36).substr(2, 9),
      agentId: "",
      agentName: "",
      date: format(new Date(), "yyyy-MM-dd"),
      quality: "",
      aht: "",
      srr: "",
      voc: "",
      errors: [],
    };
  }

  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof BulkKPIRow, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          
          // If agent changed, update agent name
          if (field === "agentId") {
            const agent = agents.find((a) => a.id === parseInt(value));
            updated.agentName = agent?.name || "";
          }

          // Validate row
          updated.errors = validateRow(updated);
          return updated;
        }
        return row;
      })
    );
  };

  const validateRow = (row: BulkKPIRow): string[] => {
    const errors: string[] = [];

    if (!row.agentId) {
      errors.push("Agent required");
    }

    if (!row.date) {
      errors.push("Date required");
    }

    // At least one KPI must be filled
    if (!row.quality && !row.aht && !row.srr && !row.voc) {
      errors.push("At least one KPI required");
    }

    // Validate ranges
    if (row.quality && (parseFloat(row.quality) < 0 || parseFloat(row.quality) > 100)) {
      errors.push("Quality must be 0-100");
    }
    if (row.aht && parseFloat(row.aht) < 0) {
      errors.push("AHT must be positive");
    }
    if (row.srr && (parseFloat(row.srr) < 0 || parseFloat(row.srr) > 100)) {
      errors.push("SRR must be 0-100");
    }
    if (row.voc && (parseFloat(row.voc) < 0 || parseFloat(row.voc) > 100)) {
      errors.push("VOC must be 0-100");
    }

    return errors;
  };

  const handlePasteFromClipboard = async () => {
    setPasting(true);

    try {
      // Read clipboard
      const clipboardText = await readClipboard();
      
      if (!clipboardText) {
        alert("Failed to read clipboard. Please make sure you've copied data and granted clipboard permissions.");
        return;
      }

      // Parse clipboard data
      const result = parseClipboardData(clipboardText);

      if (!result.success || result.rows.length === 0) {
        alert(`Failed to parse clipboard data:\n${result.errors.join('\n')}`);
        return;
      }

      // NOTE: Warnings are silently handled - warnings exist but are non-critical
      if (result.warnings.length > 0) {
        // Warnings logged but don't interrupt the flow
      }

      // Convert parsed rows to BulkKPIRow format
      const newRows: BulkKPIRow[] = [];
      const unmatchedAgents: string[] = [];

      for (const parsedRow of result.rows) {
        // Try to match agent name
        const matchResult = matchAgentName(parsedRow.agentName, agents);
        
        let agentId = "";
        let agentName = parsedRow.agentName;

        if (matchResult.matched && matchResult.agentId) {
          agentId = String(matchResult.agentId);
          const agent = agents.find(a => a.id === matchResult.agentId);
          agentName = agent?.name || parsedRow.agentName;
        } else {
          unmatchedAgents.push(parsedRow.agentName);
        }

        const row: BulkKPIRow = {
          id: Math.random().toString(36).substr(2, 9),
          agentId,
          agentName,
          date: parsedRow.date || format(new Date(), "yyyy-MM-dd"),
          quality: parsedRow.quality || "",
          aht: parsedRow.aht || "",
          srr: parsedRow.srr || "",
          voc: parsedRow.voc || "",
          errors: [],
        };

        // Validate row
        row.errors = validateRow(row);
        newRows.push(row);
      }

      // Set rows
      setRows(newRows);

      // Show summary
      let message = `Successfully pasted ${newRows.length} rows from clipboard.`;
      
      if (unmatchedAgents.length > 0) {
        message += `\n\nWarning: ${unmatchedAgents.length} agent(s) could not be matched:\n${unmatchedAgents.slice(0, 5).join(', ')}`;
        if (unmatchedAgents.length > 5) {
          message += `\n... and ${unmatchedAgents.length - 5} more`;
        }
        message += '\n\nPlease select the correct agents from the dropdowns.';
      }

      alert(message);
    } catch (error) {
      console.error("Paste error:", error);
      alert("Failed to paste from clipboard. Please try again or enter data manually.");
    } finally {
      setPasting(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all rows
    const validatedRows = rows.map((row) => ({
      ...row,
      errors: validateRow(row),
    }));

    setRows(validatedRows);

    const hasErrors = validatedRows.some((row) => row.errors.length > 0);
    if (hasErrors) {
      alert("Please fix validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const records = validatedRows.map((row) => ({
        agentId: parseInt(row.agentId),
        date: row.date,
        quality: row.quality ? parseFloat(row.quality) : null,
        aht: row.aht ? parseFloat(row.aht) : null,
        srr: row.srr ? parseFloat(row.srr) : null,
        voc: row.voc ? parseFloat(row.voc) : null,
      }));

      const response = await fetch("/api/kpis/manual/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save KPIs");
      }

      const result = await response.json();
      alert(`Successfully saved ${result.created} KPIs!`);

      // Reset form
      setRows([createEmptyRow()]);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving KPIs:", error);
      alert(error instanceof Error ? error.message : "Failed to save KPIs");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = [
      "Agent Name,Date,Quality,AHT,SRR,VOC",
      "Example Agent,2025-01-15,92.5,540,75.0,88.0",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpi-template.csv";
    a.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Bulk KPI Entry</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="w-4 h-4 mr-2" />
            {showInstructions ? "Hide" : "Show"} Instructions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasteFromClipboard}
            disabled={pasting}
          >
            {pasting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Pasting...
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4 mr-2" />
                Paste from Clipboard
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to Paste from Excel/Spreadsheet</h4>
          <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
            {getClipboardInstructions()}
          </pre>
          <div className="mt-3 text-sm text-blue-700">
            <p className="font-semibold">Quick Steps:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Copy data from Excel/Google Sheets (Ctrl+C or Cmd+C)</li>
              <li>Click "Paste from Clipboard" button above</li>
              <li>Review auto-matched agents and fix any errors</li>
              <li>Click "Save" to import all records</li>
            </ol>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 w-8">#</th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[200px]">
                Agent *
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[150px]">
                Date *
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[120px]">
                Quality (%)
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[120px]">
                AHT (s)
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[120px]">
                SRR (%)
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 min-w-[120px]">
                VOC (%)
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-slate-900 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b ${row.errors.length > 0 ? "bg-red-50" : "hover:bg-slate-50"}`}
              >
                <td className="px-3 py-2 text-sm text-slate-600">{index + 1}</td>
                <td className="px-3 py-2">
                  <select
                    value={row.agentId}
                    onChange={(e) => updateRow(row.id, "agentId", e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("Agent"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  >
                    <option value="">Select agent...</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, "date", e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("Date"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.quality}
                    onChange={(e) => updateRow(row.id, "quality", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0-100"
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("Quality"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.aht}
                    onChange={(e) => updateRow(row.id, "aht", e.target.value)}
                    min="0"
                    step="1"
                    placeholder="seconds"
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("AHT"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.srr}
                    onChange={(e) => updateRow(row.id, "srr", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0-100"
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("SRR"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.voc}
                    onChange={(e) => updateRow(row.id, "voc", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0-100"
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      row.errors.some((e) => e.includes("VOC"))
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Summary */}
      {rows.some((row) => row.errors.length > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-2">Validation Errors:</p>
          <ul className="text-sm text-red-700 space-y-1">
            {rows.map((row, index) =>
              row.errors.map((error, i) => (
                <li key={`${row.id}-${i}`}>
                  Row {index + 1}: {error}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={addRow}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows([createEmptyRow()])}
          >
            Clear All
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving {rows.length} records...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Save {rows.length} KPI{rows.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-sm text-slate-600 mt-4">
        * Required fields. Enter at least one KPI value per row. You can add multiple rows for
        batch entry.
      </p>
    </Card>
  );
}

