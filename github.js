require('dotenv').config()
const { Octokit } = require('@octokit/rest')

const {
  GH_TOKEN: githubToken,
  GIST_ID: gistId
} = process.env

const octokit = new Octokit({ auth: `token ${githubToken}` });

(async () => {
  const search = await octokit.search.repos({
    q: 'stars:>=10000',
    // max pagesize is 100
    per_page: '100',
    page: '1'
  }).catch(error => {
    console.error('Cannot search repos')
    throw error
  })

  const { toal_count, items } = search.data
  const itemsAsCSV = [['id,full_name,language,stargazers_count,description,url']]
  items.map(({ id, full_name, language, stargazers_count, description, url }) => (
    itemsAsCSV.push(`${id},${full_name},${language},${stargazers_count},${description.trim().replace(/,/g, '.').replace(/"/g, '\'')},${url}`)
  ))

  await octokit.gists.update({
    gist_id: gistId,
    description: '',
    files: {
      'github-thousand-repos.csv': {
        fileName: 'Github 万星俱乐部',
        content: itemsAsCSV.join('\n')
      }
    }
  }).catch(error => {
    console.error('Cannot update gist.')
    throw error
  })
})()
