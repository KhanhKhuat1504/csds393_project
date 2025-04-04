import { GoogleAuth } from 'google-auth-library';

export const isInappropriate = async (text: string): Promise<boolean> => {
  console.log(`[GCP] Moderation check started for text: "${text}"`);
  const THRESHOLD = 0.7;

  const auth = new GoogleAuth({
    keyFilename: './ggcloud-key.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();

  const url = 'https://language.googleapis.com/v1beta2/documents:moderateText';
  const body = {
    document: {
      type: 'PLAIN_TEXT',
      content: text,
    },
  };

  try {
    const res = await client.request({
      url,
      method: 'POST',
      data: body,
    });

    const moderationCategories = (res.data as { moderationCategories?: { name: string; confidence: number }[] }).moderationCategories;
    if (Array.isArray(moderationCategories)) {
      for (const category of moderationCategories) {
        if (category.confidence >= THRESHOLD) {
          console.log(`[GCP] Flagged as inappropriate: ${category.name} - ${category.confidence}`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error(`[GCP] Error calling moderation API:`, error);
    return true;
  }
};
