import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Front from "./frontpage/Front";
import Create from "./components/Create";
import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if the user has completed their profile
  useEffect(() => {
    const checkAccountStatus = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Query API to get user status
          const response = await fetch(`/api/users?id=${user.id}`);
          const data = await response.json();
          
          if (response.ok && data.success) {
            setIsAccountCreated(data.data.accountCreated);
          }
        } catch (error) {
          console.error("Error checking account status:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsLoading(false);
      }
    };

    checkAccountStatus();
  }, [isLoaded, isSignedIn, user]);

  // Redirect to Front page if account is already created
  useEffect(() => {
    if (!isLoading && isSignedIn && isAccountCreated) {
      router.push("/frontpage/Front");
    }
  }, [isLoading, isSignedIn, isAccountCreated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <main className={`${inter.className} min-h-screen flex flex-col items-center justify-center`}>
        <p>Loading...</p>
      </main>
    );
  }

  // If not signed in, show landing page
  if (!isSignedIn) {
    return (
      <main className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <Main />
        <Footer />
      </main>
    );
  }

  // If signed in but account not created, show Create component
  return (
    <main className={`${inter.className} min-h-screen flex flex-col`}>
      <Header />
      <Create />
      <Footer />
    </main>
  );
}
