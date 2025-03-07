import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from '../../lib/dbConnect';

const schema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    gender: { type: String, default: "" },
    accountCreated: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model("User", schema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    await dbConnect();

    try {
        const { clerkId, email, first_name, last_name, gender } = req.body;

        const user = new User({
            clerkId,
            email,
            first_name,
            last_name,
            gender,
            accountCreated: true,
        });

        await user.save();
        return res.status(201).json({ message: "User saved successfully!" });
    } catch (error) {
        return res.status(500).json({ error: "Database save failed" });
    }
}
