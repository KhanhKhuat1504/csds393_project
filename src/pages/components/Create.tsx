import { useState } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "./ui/checkbox";
import Button from "./ui/button";

function generateRandomString(length:number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}  

export default function Home() {
    const [isChecked, setIsChecked] = useState(false);
    const [gender, setGender] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const router = useRouter();

    const handleRedirect = async () => {
        if (!isChecked) {
            alert("Please check the box before redirecting");
            return;
        }
    
        try {
            const randomId = generateRandomString(5);
            const response = await fetch("/api/saveUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: generateRandomString(24),
                    email: `user${randomId}@example.com`,
                    first_name: `User${randomId}`,
                    last_name: `Test`,
                    gender,
                    birthYear,
                }),
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log("User saved successfully:", data);
                router.push("/frontpage/Front");
            } else {
                console.error("Error saving user:", data.error);
            }
        } catch (error) {
            console.error("Failed to send request:", error);
        }
    };
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {/* Multiple Choice Question */}
            <div className="mb-4">
                <p className="text-lg font-semibold">What year are you?</p>
                <div className="space-y-2">
                    {["Freshmen", "Sophomore", "Junior", "Senior", "Graduate", "Faculty"].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="quiz"
                                value={option}
                                className="cursor-pointer"
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Gender Selection */}
            <div className="mb-4">
                <p className="text-lg font-semibold">Gender:</p>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Year of Birth Input */}
            <div className="mb-4">
                <p className="text-lg font-semibold">Year of Birth:</p>
                <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Enter your birth year"
                />
            </div>

            <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                    id="terms"
                    checked={isChecked}
                    onCheckedChange={setIsChecked}
                />
                <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I agree to the terms and conditions
                </label>
            </div>
            <Button onClick={handleRedirect}>Redirect</Button>
        </main>
    );
}


