/**
 * API endpoint that handles Clerk webhook events
 * Processes user creation events to synchronize Clerk user data with our MongoDB database
 * 
 * @module api/webhooks
 */

import { Webhook } from 'svix';
import type { NextApiRequest, NextApiResponse } from 'next';
import { WebhookEvent } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const SIGNING_SECRET = process.env.SIGNING_SECRET;

/**
 * Next.js API route handler for Clerk webhooks
 * Verifies webhook signatures and processes user creation events
 * 
 * @async
 * @function handler
 * @param {NextApiRequest} req - The Next.js API request object
 * @param {NextApiResponse} res - The Next.js API response object
 * @returns {Promise<void>} Response with status and JSON data
 * @throws {Error} When SIGNING_SECRET is not configured or webhook verification fails
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (!SIGNING_SECRET) {
    throw new Error('Please add SIGNING_SECRET to .env');
  }

  // Create a new Svix instance with the secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const svixId = Array.isArray(req.headers['svix-id']) ? req.headers['svix-id'][0] : req.headers['svix-id'];
  const svixTimestamp = Array.isArray(req.headers['svix-timestamp']) ? req.headers['svix-timestamp'][0] : req.headers['svix-timestamp'];
  const svixSignature = Array.isArray(req.headers['svix-signature']) ? req.headers['svix-signature'][0] : req.headers['svix-signature'];

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing Svix headers' });
  }

  // Get the body
  const payload = req.body;
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify the payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return res.status(400).json({ error: 'Verification error' });
  }

  // Handle the event
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, gender } = evt.data;

    // Connect to MongoDB
    await dbConnect();

    // Check if the user already exists
    let user = await User.findOne({ clerkId: id });
    if (!user) {
      // Create a new user with the transformed data
      user = new User({
        clerkId: id,
        email: email_addresses[0].email_address,
        first_name: first_name || '',
        last_name: last_name || '',
        gender: gender || '',
        accountCreated: false,
        position: '',
        year: 2000,
      });
      
      await user.save();
      console.log('User saved to MongoDB:', user);
    } else {
      console.log('User already exists:', user);
    }
    return res.status(201).json({ message: 'User created', user });
  }

  return res.status(200).json({ message: 'Webhook received' });
}

/**
 * Runtime configuration for the API route
 * Ensures the route runs in a Node.js environment for compatibility with Svix and Mongoose
 */
export const config = {
  runtime: "nodejs", // Ensure this API route runs in a Node.js environment to avoid Vercel deployment errors
};