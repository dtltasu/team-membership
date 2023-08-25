import { getInput, setOutput, setFailed } from '@actions/core'
import { getOctokit, context } from '@actions/github'

run()

async function run() {
  try {
    const api = getOctokit(getInput("GITHUB_TOKEN", { required: true }), {})

    const organization = getInput("organization") || context.repo.owner
    const username = getInput("username", { required: true })
    const team = getInput("team", { required: true })
    let isTeamMember = false;

    console.log(`Will check if ${username}@${organization} belongs to ${team}`)

    api.request('GET /orgs/{org}/teams/{team}/memberships/{username}', {
      org: organization,
      team: team,
      username: username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then((response) => {
        isTeamMember = response.body.state === "active"
        setOutput("isTeamMember", isTeamMember) })
      .catch((error) => {
        onsole.log(error)
        setFailed(error.message) })

  } catch (error) {
    console.log(error)
    setFailed(error.message)
  }
}