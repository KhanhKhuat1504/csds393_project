import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-semibold text-center text-gray-700">CaseAsk Login</h1>
        <SignIn path="/sign-in" routing="path" redirectUrl="/dashboard" />
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-600">Username</label>
          <input
            type="text"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your username"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your password"
          />
        </div>
        <button className="w-full px-4 py-2 mt-6 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Login
        </button>
        <div className="mt-4 text-center">
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Don't have an account? Sign up
          </a>
        </div>
        <div className="mt-2 text-center">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </main>
  );
}



