import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const username = url.searchParams.get('username');
  if (!username) {
    return json({ error: 'No username provided' }, { status: 400 });
  }

  try {
    // Fetch user's profile page from Kattis
    const response = await fetch(`https://open.kattis.com/users/${username}`);
    
    if (!response.ok) {
      return json(
        { error: `Failed to fetch user profile from Kattis: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const html = await response.text();
    
    // Parse the HTML to extract solved problems
    // Kattis doesn't have an official API, so we need to scrape the user's profile page
    
    // Extract problem IDs from the HTML
    // The solved problems are listed in a table with links like /problems/problemid
    const problemRegex = /\/problems\/([a-z0-9]+)/g;
    const matches = html.matchAll(problemRegex);
    
    const solvedProblems = new Map();
    
    for (const match of matches) {
      const problemId = match[1];
      const url = `https://open.kattis.com/problems/${problemId}`;
      
      // We don't have exact solve timestamps from Kattis, so we use the current time
      // This means all problems will be considered solved at the same time
      if (!solvedProblems.has(url)) {
        solvedProblems.set(url, {
          url,
          problemId,
          // We don't have the exact solve time, so we use the current time
          solvedAt: new Date().toISOString()
        });
      }
    }
    
    return json({
      success: true,
      solvedProblems: Array.from(solvedProblems.values())
    });
  } catch (error) {
    console.error('Error fetching Kattis submissions:', error);
    return json(
      { error: 'Failed to fetch submissions from Kattis' },
      { status: 500 }
    );
  }
};
