import React, { createContext, useContext, useState, ReactNode } from 'react';

type NavigationContextType = {
  currentPath: string;
  currentState: any;
  navigate: (path: string, options?: { state?: any }) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState('/');
  const [currentState, setCurrentState] = useState<any>(null);

  const navigate = (path: string, options?: { state?: any }) => {
    setCurrentPath(path);
    setCurrentState(options?.state || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentPath, currentState, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigate() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigate must be used within a NavigationProvider');
  }
  return context.navigate;
}

export function useLocation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useLocation must be used within a NavigationProvider');
  }
  return { pathname: context.currentPath, state: context.currentState };
}

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ to, children, className, onClick }: LinkProps) {
  const navigate = useNavigate();

  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
