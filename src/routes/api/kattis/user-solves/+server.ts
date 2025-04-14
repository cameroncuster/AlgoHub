import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  let username = url.searchParams.get('username');
  if (!username) {
    return json({ error: 'No username provided' }, { status: 400 });
  }

  // Normalize username - Kattis usernames are typically lowercase with hyphens
  // If the username contains uppercase letters or spaces, convert them
  const originalUsername = username;
  username = username.trim().toLowerCase();

  // Replace spaces with hyphens (common mistake)
  if (username.includes(' ')) {
    console.log(`Converting spaces to hyphens in username: "${username}"`);
    username = username.replace(/ /g, '-');
  }

  if (username !== originalUsername) {
    console.log(`Normalized username from "${originalUsername}" to "${username}"`);
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

    // First, check if the user exists - log more details for debugging
    console.log(`Checking if user exists in HTML. Username: "${username}"`);
    console.log(`HTML contains >${username}<: ${html.includes(`>${username}<`)}`);
    console.log(`HTML contains >${username}</: ${html.includes(`>${username}</`)}`);

    // Try different variations of the username in the HTML
    const usernameVariations = [
      `>${username}<`,
      `>${username}</`,
      `"${username}"`,
      `/${username}"`,
      `>${username.toLowerCase()}<`,
      `>${username.toUpperCase()}<`
    ];

    let userFound = false;
    for (const variation of usernameVariations) {
      if (html.includes(variation)) {
        console.log(`Found username variation: ${variation}`);
        userFound = true;
        break;
      }
    }

    if (!userFound) {
      // Let's check if the page is a 404 or contains error messages
      if (html.includes('Page not found') || html.includes('does not exist')) {
        console.log('Page indicates user not found');
        return json({ error: `User ${username} not found on Kattis` }, { status: 404 });
      }

      // If we're here, the page exists but we couldn't find the username
      // Let's try a more lenient approach - check if the URL path is in the HTML
      if (html.includes(`/users/${username}`)) {
        console.log(`Found username in URL path: /users/${username}`);
        // User likely exists, continue processing
      } else {
        console.log('Username not found in any expected format');
        return json({ error: `User ${username} not found on Kattis` }, { status: 404 });
      }
    }

    // Check if the user has no solved problems
    if (html.includes('has not solved any problems')) {
      console.log(`User ${username} exists but has not solved any problems`);
      return json({
        success: true,
        solvedProblems: []
      });
    }

    // Log the HTML for debugging (truncated)
    console.log(`HTML length: ${html.length}`);
    console.log(`HTML snippet: ${html.substring(0, 200)}...`);

    // Try different approaches to find problem links
    console.log('Starting to extract problem links');
    const solvedProblems = new Map();

    // Try multiple approaches to find problem links
    const approaches = [
      // 1. Look for problems in the solved problems section with full HTML structure
      {
        regex: /<a href="\/problems\/([a-z0-9]+)"[^>]*>([^<]+)<\/a>/g,
        name: 'specific HTML structure'
      },

      // 2. Look for any links to problems
      { regex: /href="\/problems\/([a-z0-9]+)"/g, name: 'general problem links' },

      // 3. Look for problem IDs in the URL path
      { regex: /\/problems\/([a-z0-9]+)/g, name: 'URL paths' },

      // 4. Look for problem IDs in a different format
      { regex: /problem\/([a-z0-9]+)/g, name: 'alternative format' }
    ];

    // Try each approach until we find some problems
    for (const approach of approaches) {
      console.log(`Trying approach: ${approach.name}`);
      const matches = html.matchAll(approach.regex);
      let matchCount = 0;

      for (const match of matches) {
        matchCount++;
        const problemId = match[1];
        const url = `https://open.kattis.com/problems/${problemId}`;

        // Get problem name if available (from first approach), otherwise use problem ID
        const problemName = match.length > 2 ? match[2].trim() : problemId;

        if (!solvedProblems.has(url)) {
          solvedProblems.set(url, {
            url,
            problemId,
            name: problemName,
            solvedAt: new Date().toISOString()
          });
        }
      }

      console.log(`Found ${matchCount} matches with approach: ${approach.name}`);

      // If we found some problems, we can stop trying other approaches
      if (solvedProblems.size > 0) {
        console.log(
          `Successfully found ${solvedProblems.size} problems with approach: ${approach.name}`
        );
        break;
      }
    }

    // 3. If we still didn't find any problems but the user exists, they might have no solved problems
    if (solvedProblems.size === 0) {
      console.log(`No problems found for user ${username}, but user exists`);
      return json({
        success: true,
        solvedProblems: []
      });
    }

    // Log the number of problems found for debugging
    console.log(`Found ${solvedProblems.size} solved problems for Kattis user ${username}`);

    return json({
      success: true,
      solvedProblems: Array.from(solvedProblems.values())
    });
  } catch (error) {
    console.error('Error fetching Kattis submissions:', error);
    return json({ error: 'Failed to fetch submissions from Kattis' }, { status: 500 });
  }
};
