// pages/api/users.js
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      // Create a new user (accountCreated will be false by default)
      const newUser = await User.create(req.body);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
