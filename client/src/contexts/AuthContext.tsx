import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { login, logout, register, getCurrentUser } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid credentials",
        });
      }
      return data;
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
      return {
        success: false,
        message: error.message || "An error occurred during login"
      } as AuthResponse;
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "Could not create account",
        });
      }
      return data;
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
      return {
        success: false,
        message: error.message || "An error occurred during registration"
      } as AuthResponse;
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.clear();
      toast({
        title: "Success",
        description: "You have been logged out",
      });
      navigate('/login');
    }
  });

  // Providing the context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};