import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-semibold text-center text-gray-700">CaseAsk Login</h1>
        
        {/* Clerk Sign-In Component with Social Sign-In */}
        <SignIn path="/sign-in" routing="path" redirectUrl="/dashboard" />
        
        <div className="mt-6 text-center">
          <a href="/sign-up" className="text-blue-600 hover:underline">
            This is the front page test
          </a>
        </div>
      </div>
    </main>
  );
}
