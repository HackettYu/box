require('dotenv').config();
const got = require('got')
const { Octokit } = require("@octokit/rest");

const {
    GH_TOKEN: githubToken,
    GIST_ID: gistId
} = process.env;

const octokit = new Octokit({ auth: `token ${githubToken}` });

const getStars = (user) =>
    got(`https://api.github.com/users/${user}/starred?page=1&per_page=1000`)
        .then((res) => JSON.parse(res.body))
        .then((starred) => starred.map((ctx) => ({
            owner: ctx.owner.login,
            repo: ctx.name,
            description: ctx.description,
            language: ctx.language,
            isFork: false,
            stargazers: ctx.stargazers_count,
            watchers: ctx.watchers_count
        })));

(async () => {
    const itemsAsCSV = [['owner,repo,description,language,stargazers']];
    const items = await getStars('hackettyu');
    console.log(items)
    items.map(({ owner, repo, description, language, stargazers }) => (
        itemsAsCSV.push(`${owner},${repo},${description === null ? '' : description.trim().replace(/,/g, '.').replace(/"/g, '\'')},${language},${stargazers}`)
    ));
    await octokit.gists.update({
        gist_id: gistId,
        description: '',
        files: {
            ['github-starred.csv']: {
                fileName: 'Github starred repos',
                content: itemsAsCSV.join('\n')
            }
        }
    }).catch(error => {
        console.error('Cannot update gist.')
        throw error
    })
})();