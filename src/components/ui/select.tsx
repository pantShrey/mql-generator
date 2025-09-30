'use client';

import * as React from 'react';


interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  // Extract placeholder from SelectValue if present
  let placeholder = '';
  const childArray = React.Children.toArray(children);
  
  childArray.forEach((child: any) => {
    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, (triggerChild: any) => {
        if (triggerChild?.type === SelectValue) {
          placeholder = triggerChild.props.placeholder || '';
        }
      });
    }
  });

  // Extract only the SelectContent children to get the options
  const contentChild = childArray.find(
    (child: any) => child.type === SelectContent
  );

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {contentChild}
      </select>
    </div>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

// SelectTrigger is not used with native select, but kept for API compatibility
export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return null;
}

interface SelectValueProps {
  placeholder?: string;
}

// SelectValue is not used with native select, but kept for API compatibility
export function SelectValue({ placeholder }: SelectValueProps) {
  return null;
}