import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Front from "./frontpage/Front";
import Create from "./components/Create";
import { useUser } from '@clerk/clerk-react'

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser(); 

  if (!isSignedIn) {
    return (
      <main className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <Main />
        <Footer />
      </main>
    );
  }

  return (
    <main className={`${inter.className} min-h-screen flex flex-col`}>
      <Header />
      {/*<Front />*/}
      <Create />
      <Footer />
    </main>
  );
}
