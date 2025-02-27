import { getInput, setOutput, setFailed } from '@actions/core'
import { getOctokit, context } from '@actions/github'

run()

async function run() {
  try {
    const api = getOctokit(getInput("GITHUB_TOKEN", { required: true }), {})

    const organization = getInput("organization") || context.repo.owner
    const username = getInput("username", { required: true })
    const teams = getInput("team", { required: true }).split(',').map(t => t.trim())

    console.log(`Checking if ${username}@${organization} belongs to any of: ${teams.join(', ')}`)

    const checks = teams.map(async (team) => {
      try {
        const response = await api.request('GET /orgs/{org}/teams/{team}/memberships/{username}', {
          org: organization,
          team: team,
          username: username,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
        return response.data.state === "active"
      } catch (error) {
        console.error(`Error checking team ${team}:`, error)
        return false
      }
    })

    const results = await Promise.all(checks)
    const isTeamMember = results.includes(true)

    console.log(`User is team member: ${isTeamMember}`)
    setOutput("isTeamMember", isTeamMember)

  } catch (error) {
    console.error("Unexpected error:", error)
    setFailed(error.message)
  }
}
