"use client";

import { useDateFilter, DatePreset } from "@/contexts/DateFilterContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const presetOptions: { value: DatePreset; label: string }[] = [
  { value: 'mtd', label: 'Month to Date' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'year_ago', label: 'Year Ago' },
  { value: 'custom', label: 'Custom Range' },
];

export function DateFilter() {
  const { dateFilter, setPreset, setCustomRange } = useDateFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(dateFilter.startDate);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(dateFilter.endDate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePresetClick = (preset: DatePreset) => {
    if (preset !== 'custom') {
      setPreset(preset);
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setCustomRange(customStart, customEnd);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (dateFilter.preset === 'custom') {
      return `${format(dateFilter.startDate, 'MMM d, yyyy')} - ${format(dateFilter.endDate, 'MMM d, yyyy')}`;
    }
    return presetOptions.find(opt => opt.value === dateFilter.preset)?.label || 'Select range';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 px-4 rounded-xl border-white/10 bg-[#1A1A1A]/90 backdrop-blur-xl hover:bg-white/10 font-medium justify-between gap-2 min-w-[200px] shadow-2xl shadow-black/50 animate-pulse-subtle",
            !dateFilter && "text-gray-500"
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[#A4E83C]" />
            <span className="text-sm text-white font-semibold">{mounted ? getDisplayText() : 'Month to Date'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10 shadow-2xl" align="end" sideOffset={8}>
        <div className="flex">
          {/* Preset Options */}
          <div className="border-r border-white/10 p-3 space-y-1">
            <div className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">
              Quick Ranges
            </div>
            {presetOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-sm text-gray-400 hover:text-white hover:bg-white/5",
                  dateFilter.preset === option.value && "bg-[#A4E83C]/10 text-[#A4E83C]"
                )}
                onClick={() => handlePresetClick(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter.preset === 'custom' && (
            <div className="p-4 min-w-[600px]">
              <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
                Select Custom Range
              </div>
              
              {/* Range Preview */}
              {customStart && customEnd && (
                <div className="mb-4 p-3 bg-[#A4E83C]/10 border border-[#A4E83C]/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Selected Range</div>
                  <div className="text-sm font-semibold text-[#A4E83C]">
                    {format(customStart, 'MMM dd, yyyy')} → {format(customEnd, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.ceil((customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              )}
              
              {/* Side-by-side Range Calendar */}
              <Calendar
                mode="range"
                selected={customStart && customEnd ? { from: customStart, to: customEnd } : undefined}
                onSelect={(range) => {
                  if (range?.from) setCustomStart(range.from);
                  if (range?.to) setCustomEnd(range.to);
                }}
                numberOfMonths={2}
                className="rounded-md"
                classNames={{
                  months: "flex gap-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-white",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-400"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-md"
                  ),
                  day_selected: "bg-[#A4E83C] text-black hover:bg-[#A4E83C] hover:text-black focus:bg-[#A4E83C] focus:text-black",
                  day_today: "bg-white/5 text-white font-semibold",
                  day_outside: "text-gray-600 opacity-50",
                  day_disabled: "text-gray-700 opacity-50",
                  day_range_middle: "aria-selected:bg-[#A4E83C]/20 aria-selected:text-white",
                  day_hidden: "invisible",
                }}
                disabled={(date) => date > new Date()}
              />
              
              <Button
                onClick={handleCustomApply}
                className="w-full mt-4 bg-[#A4E83C] text-black hover:bg-[#A4E83C]/90 font-semibold"
                disabled={!customStart || !customEnd}
              >
                Apply Custom Range
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

