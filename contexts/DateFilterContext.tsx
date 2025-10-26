"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';

export type DatePreset = 'mtd' | 'last_month' | 'last_3_months' | 'last_6_months' | 'year_ago' | 'custom';

export interface DateFilter {
  startDate: Date;
  endDate: Date;
  preset: DatePreset;
}

interface DateFilterContextType {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (startDate: Date, endDate: Date) => void;
  resetFilter: () => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

const getDefaultFilter = (): DateFilter => {
  const endDate = new Date();
  const startDate = startOfMonth(endDate);
  return {
    startDate,
    endDate,
    preset: 'mtd',
  };
};

const getFilterForPreset = (preset: DatePreset): DateFilter => {
  const endDate = new Date();
  let startDate: Date;

  switch (preset) {
    case 'mtd':
      // Month to Date - 1st of current month to today
      startDate = startOfMonth(endDate);
      break;
    
    case 'last_month':
      // Last Month - Full previous month
      const lastMonth = subMonths(endDate, 1);
      startDate = startOfMonth(lastMonth);
      return {
        startDate,
        endDate: endOfMonth(lastMonth),
        preset,
      };
    
    case 'last_3_months':
      // Last 3 Months - 90 days back from today
      startDate = subDays(endDate, 90);
      break;
    
    case 'last_6_months':
      // Last 6 Months - 180 days back from today
      startDate = subDays(endDate, 180);
      break;
    
    case 'year_ago':
      // Year Ago - 365 days back from today
      startDate = subDays(endDate, 365);
      break;
    
    case 'custom':
      // Custom - return default
      return getDefaultFilter();
    
    default:
      startDate = startOfMonth(endDate);
  }

  return {
    startDate,
    endDate,
    preset,
  };
};

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  const [dateFilter, setDateFilterState] = useState<DateFilter>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dateFilter');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            startDate: new Date(parsed.startDate),
            endDate: new Date(parsed.endDate),
            preset: parsed.preset,
          };
        } catch (e) {
          console.error('Failed to parse saved date filter', e);
        }
      }
    }
    return getDefaultFilter();
  });

  useEffect(() => {
    // Save to localStorage whenever filter changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('dateFilter', JSON.stringify({
        startDate: dateFilter.startDate.toISOString(),
        endDate: dateFilter.endDate.toISOString(),
        preset: dateFilter.preset,
      }));
    }
  }, [dateFilter]);

  const setDateFilter = (filter: DateFilter) => {
    setDateFilterState(filter);
  };

  const setPreset = (preset: DatePreset) => {
    const filter = getFilterForPreset(preset);
    setDateFilterState(filter);
  };

  const setCustomRange = (startDate: Date, endDate: Date) => {
    setDateFilterState({
      startDate,
      endDate,
      preset: 'custom',
    });
  };

  const resetFilter = () => {
    setDateFilterState(getDefaultFilter());
  };

  return (
    <DateFilterContext.Provider value={{ dateFilter, setDateFilter, setPreset, setCustomRange, resetFilter }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}
