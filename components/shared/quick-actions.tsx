"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, FileCheck, Upload } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/coaching/generate">
        <Button className="gap-2" variant="default">
          <Sparkles className="w-4 h-4" />
          AI Prep
        </Button>
      </Link>
      <Link href="/audits/new">
        <Button className="gap-2" variant="outline">
          <FileCheck className="w-4 h-4" />
          Add Audit
        </Button>
      </Link>
      <Link href="/uploads">
        <Button className="gap-2" variant="outline">
          <Upload className="w-4 h-4" />
          Upload Data
        </Button>
      </Link>
    </div>
  );
}

