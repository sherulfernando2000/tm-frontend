import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCookie, getCookie, setCookie } from '../utils/cookie';
import { logout as logoutService } from "../services/authService";
import type { AuthContextType, AuthUser } from '../types/types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string>(() => getCookie("access_token") || "");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken) {
            setCookie("access_token", accessToken, 7);
        } else {
            deleteCookie("access_token");
        }
    }, [accessToken]);

    useEffect(() => {
        const tryToRestore = async () => {
            try {
                const savedToken = getCookie("access_token");
                const savedUser = getCookie("user");

                if (savedToken) {
                    setAccessToken(savedToken);
                    setUser(savedUser ? JSON.parse(savedUser) : null);

                    const currentPath = window.location.pathname;

                    if (currentPath === "/login" || currentPath === "/signup") {
                        navigate("/dashboard"); // redirect from login/signup to dashboard
                    }
                }
            } catch (error) {
                console.error("Auth restore failed:", error);
                setAccessToken("");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        tryToRestore();
    }, [navigate]);

    const login = async (userData: AuthUser, token: string) => {
        setUser(userData);
        setAccessToken(token);
        setCookie("access_token", token, 7);
        setCookie("user", JSON.stringify(userData), 7);
    };

    const logout = async () => {
        try {
            await logoutService();
            navigate("/login");
            toast.success("Logout successfully.");
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken("");
            deleteCookie("access_token");
            deleteCookie("user");
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
