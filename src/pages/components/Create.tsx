import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "./ui/checkbox";
import Button from "./ui/button";
import { useUser } from "@clerk/nextjs";

export default function Home() {
    const [isChecked, setIsChecked] = useState(false);
    const [gender, setGender] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [position, setPosition] = useState("");
    const [isAccountCreated, setIsAccountCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Check if user already has completed their profile
    useEffect(() => {
        const checkAccountStatus = async () => {
            if (isLoaded && user) {
                try {
                    const response = await fetch(`/api/users?id=${user.id}`);
                    const data = await response.json();
                    
                    if (response.ok && data.success && data.data) {
                        setIsAccountCreated(data.data.accountCreated);
                        
                        // Redirect if account is already created
                        if (data.data.accountCreated) {
                            router.push("/frontpage/Front");
                        }
                        
                        // Pre-fill gender if available
                        if (data.data.gender) {
                            setGender(data.data.gender);
                        }
                    }
                } catch (error) {
                    console.error("Error checking account status:", error);
                } finally {
                    setIsLoading(false);
                }
            } else if (isLoaded && !user) {
                setIsLoading(false);
            }
        };

        checkAccountStatus();
    }, [isLoaded, user, router]);

    // Optional: Pre-fill gender if available from Clerk metadata
    useEffect(() => {
        if (isLoaded && user && !gender) {
            const userGender = user.publicMetadata.gender as string;
            if (userGender) {
                setGender(userGender);
            }
        }
    }, [isLoaded, user, gender]);

    const handleRedirect = async () => {
        if (!isLoaded || !user) {
            alert("User information not loaded yet. Please try again.");
            return;
        }

        if (!isChecked) {
            alert("Please check the box before redirecting");
            return;
        }

        if (!position) {
            alert("Please select your position (year)");
            return;
        }
        
        if (!gender) {
            alert("Please select your gender");
            return;
        }
        
        if (!birthYear || isNaN(Number(birthYear))) {
            alert("Please enter a valid birth year");
            return;
        }
    
        try {
            // Get user details from Clerk
            const firstName = user.firstName || "";
            const lastName = user.lastName || "";
            const email = user.primaryEmailAddress?.emailAddress || "";
            
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.id, // Use the actual Clerk user ID
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    gender,
                    position,
                    year: parseInt(birthYear),
                    accountCreated: true
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
    
    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!isLoaded) {
        return <div className="flex min-h-screen items-center justify-center">Loading user information...</div>;
    }
    
    if (!user) {
        router.push("/sign-in");
        return null;
    }
    
    if (isAccountCreated) {
        router.push("/frontpage/Front");
        return null;
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-gray-600">We need a few more details to complete your account setup</p>
            </div>

            {/* Multiple Choice Question */}
            <div className="mb-4">
                <p className="text-lg font-semibold">What year are you?</p>
                <div className="space-y-2">
                    {["Freshmen", "Sophomore", "Junior", "Senior", "Graduate", "Faculty"].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="quiz"
                                value={option.toLowerCase()}
                                className="cursor-pointer"
                                checked={position === option.toLowerCase()}
                                onChange={() => setPosition(option.toLowerCase())}
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
            <Button onClick={handleRedirect}>Complete Profile</Button>
        </main>
    );
}


