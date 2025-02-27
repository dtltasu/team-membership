import { getInput, setOutput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';

// Оборачиваем запуск в IIFE для корректной работы с async/await
(async () => {
  await run();
})();

async function run() {
  try {
    // Получаем токен и инициализируем Octokit
    const token = getInput('GITHUB_TOKEN', { required: true });
    const api = getOctokit(token);

    // Входные параметры
    const organization = getInput('organization') || context.repo.owner;
    const username = getInput('username', { required: true });
    const teamsInput = getInput('team', { required: true }).trim();

    // Проверяем, что список команд не пустой
    if (!teamsInput) {
      throw new Error('Team list cannot be empty');
    }
    const teams = teamsInput.split(',').map(t => t.trim());

    console.log(`Checking if ${username}@${organization} belongs to any of: ${teams.join(', ')}`);

    // Проверяем членство в каждой команде
    const checks = teams.map(async team => {
      console.log(`Requesting membership for ${username} in team ${team} of org ${organization}`);
      try {
        const response = await api.request(
          'GET /orgs/{org}/teams/{team Slug}/memberships/{username}',
          {
            org: organization,
            team_slug: team, // Используем team_slug вместо team для корректной работы с API
            username: username,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );
        return response.data.state === 'active';
      } catch (err) {
        console.error(`Failed to check team ${team}: ${err.message}`);
        return false; // Если запрос не удался (например, команда не существует или нет прав), считаем, что пользователь не в команде
      }
    });

    // Ждем завершения всех проверок
    const results = await Promise.all(checks);
    const isTeamMember = results.includes(true);

    console.log(`User is team member: ${isTeamMember}`);
    setOutput('isTeamMember', isTeamMember);
  } catch (err) {
    // Если произошла критическая ошибка, завершаем с провалом
    setFailed(`Action failed: ${err.message}`);
  }
}