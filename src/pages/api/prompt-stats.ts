import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import UserResponse from '../../models/UserResponse';
import User from '../../models/User';

type DemographicData = {
  gender: { [key: string]: number };
  position: { [key: string]: number };
  year: { [key: string]: number }; // For age groups
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { promptId } = req.query;

    if (!promptId) {
      return res.status(400).json({ success: false, message: 'Prompt ID is required' });
    }

    // Get all responses for this prompt
    const responses = await UserResponse.find({ promptId });

    // If no responses, return empty data
    if (!responses || responses.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: {
          responseCount: 0,
          hasEnoughData: false,
          answerStats: {}
        } 
      });
    }

    // Group responses by the selected answer
    const responsesByAnswer: { [answer: string]: string[] } = {};
    
    responses.forEach(response => {
      const { selectedResponse, userId } = response;
      
      if (!responsesByAnswer[selectedResponse]) {
        responsesByAnswer[selectedResponse] = [];
      }
      
      responsesByAnswer[selectedResponse].push(userId);
    });

    // For each answer, get demographic stats
    const answerStats: { [answer: string]: { count: number, demographics: DemographicData } } = {};
    
    for (const [answer, userIds] of Object.entries(responsesByAnswer)) {
      // Get demographic information for all users who selected this answer
      const users = await User.find({ clerkId: { $in: userIds } });
      
      // Count demographics
      const demographics: DemographicData = {
        gender: {},
        position: {},
        year: {}
      };
      
      users.forEach(user => {
        // Count gender
        if (user.gender) {
          demographics.gender[user.gender] = (demographics.gender[user.gender] || 0) + 1;
        }
        
        // Count position
        if (user.position) {
          demographics.position[user.position] = (demographics.position[user.position] || 0) + 1;
        }
        
        // Count year (age) - group into age brackets
        if (user.year) {
          const currentYear = new Date().getFullYear();
          const age = currentYear - user.year;
          let ageGroup = '';
          
          if (age < 18) ageGroup = 'Under 18';
          else if (age >= 18 && age <= 24) ageGroup = '18-24';
          else if (age >= 25 && age <= 34) ageGroup = '25-34';
          else if (age >= 35 && age <= 44) ageGroup = '35-44';
          else if (age >= 45 && age <= 54) ageGroup = '45-54';
          else ageGroup = '55+';
          
          demographics.year[ageGroup] = (demographics.year[ageGroup] || 0) + 1;
        }
      });
      
      answerStats[answer] = {
        count: userIds.length,
        demographics
      };
    }

    // Calculate total responses
    const totalResponses = responses.length;
    
    // Check if there's enough data - minimum 2 responses per answer for privacy
    const hasEnoughData = Object.values(answerStats).every(stat => stat.count >= 2);

    // Return the answer stats
    return res.status(200).json({
      success: true,
      data: {
        responseCount: totalResponses,
        hasEnoughData,
        answerStats
      }
    });

  } catch (error: any) {
    console.error('Error fetching prompt statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
} 