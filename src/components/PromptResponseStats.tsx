import React, { useState, useEffect } from 'react';
import DemographicChart from './DemographicChart';

/**
 * Props interface for the PromptResponseStats component
 * 
 * @interface PromptStatsProps
 * @property {string} promptId - Unique identifier for the prompt
 * @property {string | null} selectedResponse - Currently selected response option
 * @property {string | null} [hoveredResponse] - Currently hovered response option (optional)
 * @property {string | null} [previewResponse] - Response being previewed, takes precedence over other selections (optional)
 * @property {Function} [onStatsLoaded] - Callback when statistics are loaded successfully (optional)
 */
interface PromptStatsProps {
  promptId: string;
  selectedResponse: string | null;
  hoveredResponse?: string | null;
  previewResponse?: string | null;
  onStatsLoaded?: (stats: PromptStats) => void;
}

/**
 * Interface for demographic data breakdown by category
 * 
 * @interface DemographicData
 * @property {Object} gender - Counts of responses by gender category
 * @property {Object} position - Counts of responses by academic position
 * @property {Object} year - Counts of responses by birth year/age
 */
interface DemographicData {
  gender: { [key: string]: number };
  position: { [key: string]: number };
  year: { [key: string]: number };
}

/**
 * Interface for statistics for a specific answer option
 * 
 * @interface AnswerStats
 * @property {number} count - Total number of times this answer was selected
 * @property {DemographicData} demographics - Demographic breakdown of respondents who chose this answer
 */
interface AnswerStats {
  count: number;
  demographics: DemographicData;
}

/**
 * Interface for overall prompt statistics
 * 
 * @interface PromptStats
 * @property {number} responseCount - Total number of responses to the prompt
 * @property {boolean} hasEnoughData - Whether there's sufficient data for meaningful analysis
 * @property {Object} answerStats - Statistics for each possible answer, keyed by answer text
 */
interface PromptStats {
  responseCount: number;
  hasEnoughData: boolean;
  answerStats: { [answer: string]: AnswerStats };
}

/**
 * PromptResponseStats component displays demographic statistics for prompt responses.
 * Shows charts breaking down response selection by gender, academic position, and age.
 * Handles loading states, error conditions, and different data display modes.
 * 
 * @component
 * @param {PromptStatsProps} props - Component props
 * @returns {JSX.Element} Statistical visualization or appropriate status message
 */
const PromptResponseStats: React.FC<PromptStatsProps> = ({ 
  promptId, 
  selectedResponse,
  hoveredResponse,
  previewResponse,
  onStatsLoaded
}) => {
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use the preview response if available, then hovered response, then selected response
  const displayedResponse = previewResponse || hoveredResponse || selectedResponse;

  /**
   * Calculates percentage of total responses for a given answer option
   * 
   * @param {string | null} response - The response option to calculate percentage for
   * @returns {number} Percentage (0-100) of total responses
   */
  const calculatePercentage = (response: string | null): number => {
    if (!stats || !response || !stats.answerStats[response]) {
      return 0;
    }
    
    const totalResponses = stats.responseCount;
    const responseCount = stats.answerStats[response].count;
    
    if (totalResponses === 0) return 0;
    
    return Math.round((responseCount / totalResponses) * 100);
  };

  /**
   * Fetches statistics data from the API when promptId changes
   * Updates component state based on API response
   */
  useEffect(() => {
    const fetchStats = async () => {
      if (!promptId) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/prompt-stats?promptId=${promptId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch stats: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success) {
          setStats(data.data);
          // Only call onStatsLoaded if there's actually new data
          if (onStatsLoaded && data.data) {
            onStatsLoaded(data.data);
          }
        } else {
          setError(data.message || 'Failed to load statistics');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching prompt stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Remove onStatsLoaded from dependency array to prevent infinite loops
  }, [promptId]);

  // Loading state display
  if (loading) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <p className="text-center text-red-500">Error: {error}</p>
      </div>
    );
  }

  // No data state display
  if (!stats || stats.responseCount === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">No response data available yet.</p>
      </div>
    );
  }

  // No response selected state
  if (!displayedResponse) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">Select an answer to see demographics statistics.</p>
      </div>
    );
  }

  const answerStats = stats.answerStats[displayedResponse];
  const hasEnoughData = stats.hasEnoughData && answerStats && answerStats.count >= 1;
  
  const title = previewResponse 
    ? "Demographics for Previewed Answer"
    : hoveredResponse 
      ? "Demographics for Hovered Answer" 
      : "Demographics for Selected Answer";

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      
      {answerStats ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {hasEnoughData 
              ? `Showing demographic data from ${answerStats.count} response${answerStats.count !== 1 ? 's' : ''}.` 
              : 'No responses recorded for this answer yet.'}
          </p>
          
          {hasEnoughData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DemographicChart 
                data={answerStats.demographics.gender} 
                title="Gender Distribution" 
                type="gender"
                isEnoughData={hasEnoughData}
              />
              
              <DemographicChart 
                data={answerStats.demographics.position} 
                title="Academic Position" 
                type="position"
                isEnoughData={hasEnoughData}
              />
              
              <DemographicChart 
                data={answerStats.demographics.year} 
                title="Age Distribution" 
                type="year"
                isEnoughData={hasEnoughData}
              />
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 font-medium">Not enough data</p>
              <p className="text-sm text-gray-500 mt-2">There are no responses for this answer.</p>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 font-medium">No data available</p>
          <p className="text-sm text-gray-500 mt-2">There are no responses for this answer yet.</p>
        </div>
      )}
    </div>
  );
};

export default PromptResponseStats; 