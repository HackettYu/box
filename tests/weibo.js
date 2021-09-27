const axios = require('axios')
const cheerio = require('cheerio')

axios.get('https://s.weibo.com/top/summary').then(res => {
  if (res.status === 200) {
    const { data } = res
    const $ = cheerio.load(data)
    const list = []
    let desc = ''
    $('ul.list_a').find('li').map(function () {
      const target = $(this)
      const rank = target.find('.hot').text()
      let title = target.find('span').text()
      if (rank == null || Number(rank) <= 0) {
        list.push('rank,title,number')
        // this is a pinned title
        desc = `Pin ${title}`
      } else {
        const res = /[0-9]+[\s]*$/.exec(title)
        let number = 'UNKNOWN'
        if (res != null)
        { number = res[0].trim() }
        title = title.trim().replace(number, '').replace(',', '.')
        list.push(`${rank},${title},${number},`)
      }
    })
    return list, desc
  } else {
    throw new Error('Cannot fetch rank data')
  }
}).catch(error => {
  throw error
})
