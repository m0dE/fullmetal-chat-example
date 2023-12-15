// FetchModelsUtility.js

import { FullmetalAPIURL, FullmetalApiKey } from '../config';

const fetchModelsUtility = async () => {
  try {
    const response = await fetch(`${FullmetalAPIURL}/models`, {
      headers: { apiKey: FullmetalApiKey },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    return result.models || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export default fetchModelsUtility;
