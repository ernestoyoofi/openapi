const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")

const baseURL = {
  recommend: "https://komikcast.cz/project-list/", // Recommend Page
  genre: "https://komikcast.cz/genres/", // Genre
  search: "https://api.komiku.id/", // Search
  detail: "https://komiku.id/manga/", // View Details
  read: "https://komiku.id/" // Read / View Comic
}

const nextingPages = (next) => {
  const dataInt = isNaN(next)? '0' : Number(next.replace(/[^0-9]+/g, ""))
  if(dataInt > 1) {
    return `page/${dataInt}/`
  }
  return ''
}

async function Manga_Recommend({ length }) {
  const getInts = nextingPages(length)
}