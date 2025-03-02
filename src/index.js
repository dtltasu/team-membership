// index.js
exports.run = async function(core, github) {
  try {
    const token = core.getInput('GITHUB_TOKEN', { required: true });
    const api = github.getOctokit(token);
    const organization = core.getInput('organization') || github.context.repo.owner;
    const username = core.getInput('username', { required: true });
    const teamsInput = core.getInput('team', { required: true }).trim();

    if (!teamsInput) {
      throw new Error('Team list cannot be empty');
    }
    const teams = teamsInput.split(',').map(t => t.trim());

    console.log(`Checking if ${username}@${organization} belongs to any of: ${teams.join(', ')}`);

    const checks = teams.map(async team => {
      console.log(`Requesting membership for ${username} in team ${team} of org ${organization}`);
      try {
        const response = await api.request(
          'GET /orgs/{org}/teams/{team_slug}/memberships/{username}',
          {
            org: organization,
            team_slug: team,
            username: username,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );
        return response.data.state === 'active';
      } catch (err) {
        console.error(`Failed to check team ${team}: ${err.message}`);
        return false;
      }
    });

    const results = await Promise.all(checks);
    const isTeamMember = results.includes(true);

    console.log(`User is team member: ${isTeamMember}`);
    core.setOutput('isTeamMember', isTeamMember);
  } catch (err) {
    core.setFailed(`Action failed: ${err.message}`);
  }
};