import type { YouTubeVideo } from '../types';

/**
 * Searches for karaoke videos using the YouTube Data API v3.
 * @param query The search term entered by the user.
 * @param apiKey The YouTube Data API v3 key.
 * @returns A promise that resolves to an array of YouTube video items.
 */
export const searchVideos = async (query: string, apiKey: string): Promise<YouTubeVideo[]> => {
  if (!apiKey) {
    // This error will be shown to the user if the API key is not provided.
    throw new Error('YouTube API key is not provided.');
  }

  const searchEndpoint = 'https://www.googleapis.com/youtube/v3/search';
  
  // Construct the query parameters for the API request.
  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query} karaoke`, // Append "karaoke" to the user's query for better results.
    key: apiKey,
    type: 'video',
    maxResults: '20', // Fetch up to 20 results.
  });

  try {
    const response = await fetch(`${searchEndpoint}?${params}`);

    // If the response is not ok (e.g., 4xx or 5xx error), parse the error and throw it.
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // The API returns an object with an 'items' array containing the videos.
    return data.items || [];
  } catch (error) {
    console.error('YouTube search failed:', error);
    // Re-throw the error so the UI component can catch it and display a message.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown network error occurred.');
  }
};