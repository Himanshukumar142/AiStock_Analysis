// In production, VITE_API_URL points to Render backend.
// In development, it is empty so Vite proxy handles /api/* calls.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function analyzeCompany(companyName) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company: companyName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server failed to analyze the company.');
    }

    return data;
  } catch (error) {
    console.error('API Error in analyzeCompany:', error);
    throw error;
  }
}

export async function getStockChart(companyName) {
  try {
    const response = await fetch(`${BASE_URL}/api/chart/${encodeURIComponent(companyName)}`);
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

export async function getSuggestions(query) {
  if (!query || query.trim() === '') return [];
  try {
    const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(query)}`);
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
