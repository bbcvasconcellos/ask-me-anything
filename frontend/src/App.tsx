import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { CreateRoom } from "./pages/create-room";
import { Room } from "./pages/room";

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
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors invert/>
    </>
  )
}

export default App
