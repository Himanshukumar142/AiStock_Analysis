/**
 * API Service for communicating with the backend Express server.
 * Uses native fetch API to process requests.
 */

/**
 * Sends a research analysis request for a company.
 * @param {string} companyName - Name of the target company or stock ticker.
 * @returns {Promise<Object>} The generated structured report JSON.
 */
export async function analyzeCompany(companyName) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company: companyName })
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw formatted error to be caught by the UI controller
      throw new Error(data.error || 'Server failed to analyze the company.');
    }

    return data;
  } catch (error) {
    console.error('API Error in analyzeCompany:', error);
    throw error;
  }
}

/**
 * Fetches stock chart data from backend.
 * @param {string} companyName - Name or symbol of company.
 * @returns {Promise<Object>}
 */
export async function getStockChart(companyName) {
  try {
    const response = await fetch(`/api/chart/${encodeURIComponent(companyName)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stock chart.');
    }
    return data;
  } catch (error) {
    console.error('API Error in getStockChart:', error);
    throw error;
  }
}

/**
 * Fetches company autocomplete suggestions from backend.
 * @param {string} query - The partial query typed by user.
 * @returns {Promise<Array>}
 */
export async function getSuggestions(query) {
  if (!query || query.trim() === '') return [];
  try {
    const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch suggestions.');
    }
    return data;
  } catch (error) {
    console.error('API Error in getSuggestions:', error);
    return [];
  }
}
