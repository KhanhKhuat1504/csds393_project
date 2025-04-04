import React, { useState, useEffect } from 'react';
import DemographicChart from './DemographicChart';

interface PromptStatsProps {
  promptId: string;
  selectedResponse: string | null;
}

interface DemographicData {
  gender: { [key: string]: number };
  position: { [key: string]: number };
  year: { [key: string]: number };
}

interface AnswerStats {
  count: number;
  demographics: DemographicData;
}

interface PromptStats {
  responseCount: number;
  hasEnoughData: boolean;
  answerStats: { [answer: string]: AnswerStats };
}

const PromptResponseStats: React.FC<PromptStatsProps> = ({ promptId, selectedResponse }) => {
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [promptId]);

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <p className="text-center text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!stats || stats.responseCount === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">No response data available yet.</p>
      </div>
    );
  }

  // If there's no selected response, just show a general message
  if (!selectedResponse) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">Select an answer to see demographics statistics.</p>
      </div>
    );
  }

  const answerStats = stats.answerStats[selectedResponse];
  const hasEnoughData = stats.hasEnoughData && answerStats && answerStats.count >= 3;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Demographics for Selected Answer</h3>
      
      {answerStats ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {hasEnoughData 
              ? `Showing demographic data from ${answerStats.count} responses.` 
              : 'Not enough responses to show detailed demographics (minimum 2 required).'}
          </p>
          
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
        </>
      ) : (
        <p className="text-center text-gray-500">No data available for this response.</p>
      )}
    </div>
  );
};

export default PromptResponseStats; 