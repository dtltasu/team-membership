import { getInput, setOutput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';

(async () => {
  await run();
})();

async function run() {
  try {
    const api = getOctokit(getInput("GITHUB_TOKEN", { required: true }));
    const organization = getInput("organization") || context.repo.owner;
    const username = getInput("username", { required: true });
    const teamsInput = getInput("team", { required: true }).trim();
    
    if (!teamsInput) throw new Error("Team list cannot be empty");
    const teams = teamsInput.split(',').map(t => t.trim());

    console.log(`Checking if ${username}@${organization} belongs to any of: ${teams.join(', ')}`);

    const checks = teams.map(team => 
      api.request('GET /orgs/{org}/teams/{team}/memberships/{username}', {
        org: organization,
        team: team,
        username: username,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      .then(response => response.data.state === "active")
      .catch(err => {
        console.log(`Failed to check team ${team}: ${err.message}`);
        return false;
      })
    );

    const results = await Promise.all(checks);
    const isTeamMember = results.includes(true);

    console.log(`User is team member: ${isTeamMember}`);
    setOutput("isTeamMember", isTeamMember);
  } catch (err) {
    setFailed(err.message);
  }
}