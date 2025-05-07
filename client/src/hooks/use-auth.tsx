import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extended user type that includes verification status
interface ExtendedUser extends SelectUser {
  tempOtp?: string;
  needsVerification?: boolean;
  verified?: boolean;
}

type AuthContextType = {
  user: ExtendedUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<ExtendedUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<ExtendedUser, Error, InsertUser>;
  verifyOtpMutation: UseMutationResult<ExtendedUser, Error, { otp: string }>;
  resendOtpMutation: UseMutationResult<{ tempOtp: string }, Error, void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      return data;
    },
    onSuccess: (user: ExtendedUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      if (user.needsVerification) {
        toast({
          title: "Verification required",
          description: "Please verify your account to continue",
        });
      } else {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.username}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // OTP verification mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      const res = await apiRequest("POST", "/api/verify-otp", { otp });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      return data;
    },
    onSuccess: (user: ExtendedUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Verification successful",
        description: "Your account has been verified",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/resend-otp");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "OTP sent",
        description: "A new verification code has been sent",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resend OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      return data;
    },
    onSuccess: (user: ExtendedUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      if (user.needsVerification) {
        toast({
          title: "Registration successful",
          description: `Please verify your ${user.email ? 'email' : 'phone number'} to complete registration.`,
        });
        
        // For testing purposes, log the OTP to the console
        if (user.tempOtp) {
          console.log(`OTP for verification: ${user.tempOtp}`);
        }
      } else {
        toast({
          title: "Registration successful",
          description: `Welcome, ${user.username}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user as ExtendedUser | null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        verifyOtpMutation,
        resendOtpMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}