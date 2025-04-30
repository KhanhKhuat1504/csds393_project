/**
 * API endpoint for retrieving response statistics for prompts
 * Provides demographic breakdown of responses by gender, position, and age
 * 
 * @module api/prompt-stats
 */

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import UserResponse from '../../models/UserResponse';
import User from '../../models/User';

/**
 * Type definition for demographic data organization
 * Groups user counts by various demographic categories
 * 
 * @typedef {Object} DemographicData
 * @property {Object.<string, number>} gender - Counts of responses by gender category
 * @property {Object.<string, number>} position - Counts of responses by academic position
 * @property {Object.<string, number>} year - Counts of responses by age group
 */
type DemographicData = {
  gender: { [key: string]: number };
  position: { [key: string]: number };
  year: { [key: string]: number }; // For age groups
};

/**
 * Next.js API route handler for prompt statistics
 * Analyzes and groups user responses by demographic factors
 * Only supports GET method
 * 
 * @async
 * @function handler
 * @param {NextApiRequest} req - The Next.js API request object
 * @param {NextApiResponse} res - The Next.js API response object
 * @returns {Promise<void>} Response with status and statistics data
 */
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

    /**
     * Group responses by the selected answer
     * Maps each answer option to an array of user IDs who selected it
     * 
     * @type {Object.<string, string[]>}
     */
    const responsesByAnswer: { [answer: string]: string[] } = {};
    
    responses.forEach(response => {
      const { selectedResponse, userId } = response;
      
      if (!responsesByAnswer[selectedResponse]) {
        responsesByAnswer[selectedResponse] = [];
      }
      
      responsesByAnswer[selectedResponse].push(userId);
    });

    /**
     * Stores statistics for each answer option
     * Contains count and demographic breakdown for each response option
     * 
     * @type {Object.<string, {count: number, demographics: DemographicData}>}
     */
    const answerStats: { [answer: string]: { count: number, demographics: DemographicData } } = {};
    
    // Process each answer option
    for (const [answer, userIds] of Object.entries(responsesByAnswer)) {
      // Get demographic information for all users who selected this answer
      const users = await User.find({ clerkId: { $in: userIds } });
      
      // Initialize demographic counters
      const demographics: DemographicData = {
        gender: {},
        position: {},
        year: {}
      };
      
      // Count demographic data from user profiles
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
    
    // Always show data regardless of response count (minimum is 1)
    const hasEnoughData = totalResponses > 0;

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