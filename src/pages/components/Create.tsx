import { useState } from "react";
import mongoose from "mongoose";
import { useRouter } from "next/navigation";
import Checkbox from "./ui/checkbox";
import Button from "./ui/button";
import User from "../../models/User";

export default function Home() {
    const [isChecked, setIsChecked] = useState(false);
    const router = useRouter();

    const handleRedirect = async () => {
        const updateAccountCreated = async () => {
            try {
                await fetch("/api/prompts"); // Ensures database connection

                const filter = { _id: '67c0c2d762512db4f77090dd' };
                const update = { accountCreated: true };

                const updatedUser = await User.findOneAndUpdate(filter, update, { new: true });

                console.log("Updated document:", updatedUser);

            } catch (error) {
                console.error("Failed to update accountCreated:", error);
            }
        };

        if (isChecked) {
            await updateAccountCreated(); // Ensure it completes before redirecting
            router.push("/frontpage/Front");
        } else {
            alert("Please check the box before redirecting");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
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

