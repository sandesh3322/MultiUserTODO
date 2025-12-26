
import "./globals.css";
import AuthProvider from "@/components/auth/authcontext";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       <AuthProvider>{children}
         <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /></AuthProvider> 
      </body>
    </html>
  );
}
