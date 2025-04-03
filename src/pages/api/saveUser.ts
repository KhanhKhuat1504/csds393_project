import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from '../../lib/dbConnect';
//import { useUser } from '@clerk/clerk-react'; 

const schema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    gender: { type: String, default: "" },
    accountCreated: { type: Boolean, default: false },
    position: { type: String, default: "" },
    year: { type: Number, default: 2000}, 
});

const User = mongoose.models.User || mongoose.model("User", schema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    await dbConnect();

    try {
        const { clerkId, email, first_name, last_name, gender } = req.body;

        const caseUser = new User({
            clerkId,
            email,
            first_name,
            last_name,
            gender,
            accountCreated: true,
            position: "", 
            year: 2000, 
        });

        // Get the clerkId directly from the request body
        if(clerkId) {
            const existingUser = await User.findOneAndUpdate(
                { clerkId: clerkId },
                { accountCreated: true },
                { new: true }
            );
            if (existingUser) {
                return res.status(200).json({ message: "User updated successfully!" });
            }
        }
        
        
        const savedUser = await caseUser.save();

        const updatedDocument = await User.findByIdAndUpdate(
            savedUser._id,
            { $set: { accountCreated: true } },
            { new: true });

        return res.status(201).json({ message: "User saved successfully!" });
        
    } catch (error) {
        return res.status(500).json({ error: "Database save failed" });
    }
}
