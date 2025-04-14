import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const username = url.searchParams.get('username');
  if (!username) {
    return json({ error: 'No username provided' }, { status: 400 });
  }

  try {
    // Fetch user's submissions from Codeforces API
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      return json(
        { error: data.comment || 'Failed to fetch submissions from Codeforces' },
        { status: 500 }
      );
    }

    // Filter for accepted submissions only
    const acceptedSubmissions = data.result.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (submission: any) => submission.verdict === 'OK'
    );

    // Extract unique problem URLs and solved timestamps
    const solvedProblems = new Map();

    for (const submission of acceptedSubmissions) {
      const problem = submission.problem;
      const contestId = problem.contestId;
      const index = problem.index;
      
      // Handle gym problems
      const isGym = contestId >= 100000;
      
      // Create normalized URL
      const url = isGym
        ? `https://codeforces.com/gym/${contestId}/problem/${index}`
        : `https://codeforces.com/contest/${contestId}/problem/${index}`;
      
      // Only keep the earliest solve for each problem
      if (!solvedProblems.has(url) || submission.creationTimeSeconds < solvedProblems.get(url).solvedAtTimestamp) {
        solvedProblems.set(url, {
          url,
          name: problem.name,
          solvedAt: new Date(submission.creationTimeSeconds * 1000).toISOString(),
          solvedAtTimestamp: submission.creationTimeSeconds
        });
      }
    }

    return json({
      success: true,
      solvedProblems: Array.from(solvedProblems.values())
    });
  } catch (error) {
    console.error('Error fetching Codeforces submissions:', error);
    return json(
      { error: 'Failed to fetch submissions from Codeforces' },
      { status: 500 }
    );
  }
};
