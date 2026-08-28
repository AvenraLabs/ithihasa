import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.js';
import { AvatarProvider } from './context/AvatarContext.js';
import { router } from './app/router.js';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AvatarProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-center" theme="system" closeButton />
        </QueryClientProvider>
      </AvatarProvider>
    </ThemeProvider>
  );
};

export default App;
