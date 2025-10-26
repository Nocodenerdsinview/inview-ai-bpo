"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Briefcase, Image } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: string;
  tenure: number;
  hireDate: string;
}

interface EditProfileDialogProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProfileDialog({ agent, open, onOpenChange, onSuccess }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: agent.name,
    email: agent.email,
    role: agent.role,
    avatarUrl: agent.avatarUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent profile");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating agent:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const generateNewAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setFormData({
      ...formData,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Agent Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full bg-slate-100 ring-4 ring-slate-200"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateNewAvatar}
              className="text-xs"
            >
              <Image className="w-3 h-3 mr-1" />
              Generate New Avatar
            </Button>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Briefcase className="w-4 h-4" />
              Role
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="Agent">Agent</option>
              <option value="Senior Agent">Senior Agent</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          {/* Custom Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-sm font-semibold text-slate-700">
              Custom Avatar URL (optional)
            </Label>
            <input
              id="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-slate-500">Leave empty to use generated avatar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Dialog Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

