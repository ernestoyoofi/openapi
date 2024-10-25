/**
 *  Postponed during the development period
 * 
 *  The site is not recommended for some people, so it's on hold for now, if you have the code for this part of the site, please pull request so I can check it again.
 */

const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")
const nextpage = require("./more/nextpage")

const globalURL = {
  home: "https://anoboy.foundation/"
}

async function GetHomeRecommend({ length } = {}) {
  const url = globalURL.home + nextpage.GetNextPagePath(length)
  const data = await RequestApi(url)
  console.log(data.data)
  const $ = cheerio.load(data.data)

  let listwatch = []
  $(".home_index a[rel=\"bookmark\"]").each((i, e) => {
    listwatch.push({

    })
  })
}