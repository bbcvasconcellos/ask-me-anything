import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { CreateRoom } from "./pages/create-room";
import { Room } from "./pages/room";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <CreateRoom />,
    },
    {
      path: "/room/:roomID",
      element: <Room />,
      
    }
  ])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors invert/>
    </QueryClientProvider>
  )
}

export default App
