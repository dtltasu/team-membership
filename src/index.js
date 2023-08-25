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

    api.rest
       .orgs
       .getMembershipForUserInOrg({ org: organization, team_slug: team, username: username})
       .then((response) => {
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