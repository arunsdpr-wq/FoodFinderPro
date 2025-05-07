import { useState } from 'react';
import { OTPInput } from './ui/otp-input';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface OtpVerificationProps {
  onVerificationSuccess?: () => void;
}

export function OtpVerification({ onVerificationSuccess }: OtpVerificationProps) {
  const { user, verifyOtpMutation, resendOtpMutation } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  
  const verificationType = user?.email ? 'email' : 'phone';
  const contactValue = user?.email || user?.phoneNumber;
  
  const handleVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate({ otp }, {
      onSuccess: () => {
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      }
    });
  };
  
  const handleResendOtp = () => {
    resendOtpMutation.mutate(undefined, {
      onSuccess: () => {
        setOtpSent(true);
        // Reset after 30 seconds
        setTimeout(() => setOtpSent(false), 30000);
      }
    });
  };
  
  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verification Required</h2>
        <p className="mt-2 text-gray-600">
          We've sent a verification code to your {verificationType}:
          <span className="font-semibold block mt-1">
            {contactValue ? (
              verificationType === 'email' 
                ? contactValue 
                : `${contactValue.slice(0, 4)}****${contactValue.slice(-2)}` // Mask phone numbers
            ) : 'your contact information'}
          </span>
        </p>
      </div>
      
      <div className="w-full">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Enter verification code:</p>
          <OTPInput 
            length={6} 
            onComplete={handleVerifyOtp} 
            disabled={verifyOtpMutation.isPending}
          />
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleResendOtp}
            variant="outline"
            disabled={resendOtpMutation.isPending || otpSent}
            className="text-sm"
          >
            {resendOtpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : otpSent ? (
              "Code sent! Check your inbox"
            ) : (
              "Resend verification code"
            )}
          </Button>
        </div>
      </div>
      
      {/* For testing purpose in development mode, show the OTP in the UI */}
      {process.env.NODE_ENV === 'development' && user?.tempOtp && (
        <div className="mt-4 p-2 bg-gray-100 rounded-md text-sm">
          <p className="text-gray-500">Development OTP: <span className="font-mono font-bold">{user.tempOtp}</span></p>
        </div>
      )}
      
      {verifyOtpMutation.isPending && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Verifying...</span>
        </div>
      )}
    </div>
  );
}