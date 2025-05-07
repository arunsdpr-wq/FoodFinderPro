import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    if (value === '') {
      // Handle backspace/delete
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }
    
    // Only take the last character if they pasted multiple characters
    const lastChar = value.charAt(value.length - 1);
    
    // Only allow numbers
    if (/^[0-9]$/.test(lastChar)) {
      const newOtp = [...otp];
      newOtp[index] = lastChar;
      setOtp(newOtp);
      
      // Move to next input if available
      if (index < length - 1) {
        focusInput(index + 1);
      } else {
        // If last input, check if OTP is complete and call onComplete
        const completeOtp = newOtp.join('');
        if (completeOtp.length === length) {
          onComplete(completeOtp);
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        // Move to previous input when backspace is pressed on an empty input
        if (index > 0) {
          focusInput(index - 1);
        }
      } else {
        // Clear current input first when it has a value
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's a number and has the right length
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, length);
      
      const newOtp = [...otp];
      
      // Fill starting from current index
      digits.forEach((digit, i) => {
        const targetIndex = index + i;
        if (targetIndex < length) {
          newOtp[targetIndex] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => val === '');
      if (nextEmptyIndex !== -1) {
        focusInput(nextEmptyIndex);
      } else {
        focusInput(length - 1);
        
        // Submit if complete
        const completeOtp = newOtp.join('');
        if (completeOtp.length === length) {
          onComplete(completeOtp);
        }
      }
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={(el) => (inputRefs.current[index] = el)}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          className={cn(
            "w-10 h-12 text-center rounded-md border border-input bg-background text-xl",
            "font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}