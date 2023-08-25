import { getInput, setOutput, setFailed } from '@actions/core'
import { getOctokit, context } from '@actions/github'

run()

async function run() {
  try {
    const api = getOctokit(getInput("GITHUB_TOKEN", { required: true }), {})

    const organization = getInput("organization") || context.repo.owner
    const username = getInput("username", { required: true })
    const team = getInput("team", { required: true })

    console.log(`Will check if ${username}@${organization} belongs to ${team}`)

    api.request('GET /orgs/{org}/teams/{team}/memberships/{username}', {
      org: organization,
      team: team,
      username: username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then((response) => {
        console.log(response.data)
        console.log('response.data.state === "active"', response.data.state === "active")

        setOutput("isTeamMember", response.data.state === "active")
      })

  } catch(error) {
    setOutput("isTeamMember", false)
    console.log(error)
  }
}