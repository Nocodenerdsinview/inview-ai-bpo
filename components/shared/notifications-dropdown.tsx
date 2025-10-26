"use client";

import { useState } from "react";
import { Bell, Calendar, FileCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Notification {
  id: number;
  type: "coaching" | "audit" | "pattern" | "followup";
  message: string;
  link?: string;
  time: string;
}

export function NotificationsDropdown() {
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: "coaching",
      message: "Coaching session with Sarah Johnson in 2 hours",
      link: "/coaching/quick-prep/1",
      time: "2 hours",
    },
    {
      id: 2,
      type: "followup",
      message: "Follow-up due: Check Michael's AHT improvement",
      link: "/agents/2",
      time: "Today",
    },
    {
      id: 3,
      type: "audit",
      message: "3 agents overdue for quality audit",
      link: "/audits/tracking",
      time: "Yesterday",
    },
    {
      id: 4,
      type: "pattern",
      message: "New red flag detected: Team SRR declining",
      link: "/insights",
      time: "2 days ago",
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "coaching":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "audit":
        return <FileCheck className="w-4 h-4 text-purple-600" />;
      case "pattern":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-600">{notifications.length} unread</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || "#"}
              className="block p-3 hover:bg-slate-50 border-b border-slate-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-2 border-t border-slate-200">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

