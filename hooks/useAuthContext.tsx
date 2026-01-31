import { AuthContextType } from "@/interfaces/auth";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}