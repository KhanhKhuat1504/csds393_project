"use client";

//change test 

import { useState } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "./ui/checkbox";
import Button from "./ui/button";

export default function Home() {
    const [isChecked, setIsChecked] = useState(false);
    const router = useRouter();

    const handleRedirect = () => {
        if (isChecked) {
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
