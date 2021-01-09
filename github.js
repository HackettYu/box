require('dotenv').config({ path: '.env' });
const Octokit = require("@octokit/rest");

const {
    GITHUB_PERSONAL_TOKEN: githubPersonalToken,
    GIST_ID: gistId
} = process.env;

const octokit = new Octokit({ auth: `token ${githubPersonalToken}` });

; (async () => {
    const search = await octokit.search.repos({
        q: 'stars:>=10000',
        per_page: '1',
        page: '1'
    }).catch(error => {
        console.error('Cannot search repos');
        throw error;
    });
    const { toal_count, items } = search.data;
    const itemsAsCSV = [['id,full_name,language,stargazers_count,description,url']];
    items.map(({ id, full_name, language, stargazers_count, description, url }) => (
        itemsAsCSV.push(`${id},${full_name},${language},${stargazers_count},${description},${url}`)
    ));

    console.log(`Total: ${toal_count}`);
    await octokit.gists.update({
        gist_id: gistId,
        description: '',
        files: {
            ['github-thousand-repos.csv']: {
                fileName: 'Github 万星俱乐部',
                content: itemsAsCSV.join('\n')
            }
        }
    }).catch(error => {
        console.error('Cannot update gist.')
        throw error
    })
})();