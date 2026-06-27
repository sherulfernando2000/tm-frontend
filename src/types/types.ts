export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string;
    organizationId: number;
    createdAt: string;
    updatedAt: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    loading: boolean;
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    user: User;
}

export interface Payment {
  clientName: string;
  companyName: string;
  amount: number;
  currency: string;
  paymentType: string;
  description: string;
  customerEmail: string;
}

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  accessToken?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}




