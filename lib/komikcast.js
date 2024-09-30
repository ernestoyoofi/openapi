const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")

const baseURL = {
  recommend: "https://komikcast.cz/daftar-komik/", // Recommend Page
  genre: "https://komikcast.cz/genres/", // Genre
  search: "https://komikcast.cz/", // Search
  detail: "https://komikcast.cz/komik/", // Detail
  read: "https://komikcast.cz/chapter/" // Read Chapter
}

const numberingPages = (next) => {
  const a = Math.floor(isNaN(next)? 0 : Number(next.replace(/[^0-9]+/g, "")))
  return a < 0? 0 : a + 1
}
const nextingPages = (next) => {
  const dataInt = numberingPages(next)
  if(dataInt > 1) {
    return `page/${dataInt}/`
  }
  return ''
}

async function Manga_Recommend({ length }) {
  const getInts = nextingPages(length)
  const url = `${baseURL.recommend}${getInts}?status=&type=&orderby=update`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".komiklist_filter .list-update_items-wrapper .list-update_item").each((i, el) => {
    const showRec = $(".list-update_item-info .other .chapter", el)?.eq(0)

    list.push({
      image: $("img", el)?.eq(0)?.attr("src"),
      title: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      desc: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      rate: $(".list-update_item-info .other .numscore", el)?.eq(0)?.text()?.trim(),
      rec: {
        label: $(".list-update_item-info .other .chapter", el)?.eq(0)?.text()?.trim() || "",
        slug: showRec.attr("href")? new URL(showRec?.attr("href")).pathname.split("/")[2] : "",
        update: "-"
      },
      slug: new URL($("a", el)?.attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$(".komiklist_filter .pagination a").eq(1)?.text(),
    list,
  }
}

async function Manga_Search({ query, length }) {
  const getInts = nextingPages(length)
  const url = `${baseURL.search}${getInts}?s=${query}`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".list-update_items-wrapper .list-update_item").each((i, el) => {
    const showRec = $(".list-update_item-info .other .chapter", el)?.eq(0)

    list.push({
      image: $("img", el)?.eq(0)?.attr("src"),
      title: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      desc: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      rate: $(".list-update_item-info .other .numscore", el)?.eq(0)?.text()?.trim(),
      rec: {
        label: $(".list-update_item-info .other .chapter", el)?.eq(0)?.text()?.trim() || "",
        slug: showRec.attr("href")? new URL(showRec?.attr("href")).pathname.split("/")[2] : "",
        update: "-"
      },
      slug: new URL($("a", el)?.attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$(".komiklist_filter .pagination a").eq(1)?.text(),
    list,
  }
}

async function Manga_Genre({ slug, length }) {
  const getInts = nextingPages(length)
  const url = `${baseURL.genre}${slug}/${getInts}`
  console.log(url)
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".list-update_items-wrapper .list-update_item").each((i, el) => {
    const showRec = $(".list-update_item-info .other .chapter", el)?.eq(0)

    list.push({
      image: $("img", el)?.eq(0)?.attr("src"),
      title: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      desc: $(".list-update_item-info .title", el)?.eq(0)?.text()?.trim(),
      rate: $(".list-update_item-info .other .numscore", el)?.eq(0)?.text()?.trim(),
      rec: {
        label: $(".list-update_item-info .other .chapter", el)?.eq(0)?.text()?.trim() || "",
        slug: showRec.attr("href")? new URL(showRec?.attr("href")).pathname.split("/")[2] : "",
        update: "-"
      },
      slug: new URL($("a", el)?.attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$(".komiklist_filter .pagination a").eq(1)?.text(),
    list,
  }
}

async function Manga_Detail({ slug }) {
  const url = `${baseURL.detail}${slug}/`
  const data = await RequestApi(url)
  if(data.status != 200) {
    return { notFound: true }
  }
  const $ = cheerio.load(data.data)
  let listchapter = []
  let listgenre = []

  $(".komik_info-content-genre a.genre-item").each((i ,el) => {
    listgenre.push({
      label: $(el)?.text()?.trim(),
      slug: $(el)?.text()?.trim()?.toLowerCase()?.replace(/ /g, "-")
    })
  })
  $("#chapter-wrapper .komik_info-chapters-item").each((i, el) => {
    listchapter.push({
      key: $("#chapter-wrapper .komik_info-chapters-item").length - i - 1,
      ch: $(".chapter-link-item", el)?.text()?.trim()?.replace(/\n/," "),
      seris_date: $(".chapter-link-time", el)?.text()?.trim(),
      slug: new URL($("a", el)?.attr("href"))?.pathname?.split("/")[2]
    })
  })

  return {
    cover: $(".komik_info-content img").eq(0).attr("src"),
    title: $(".komik_info-content h1")?.text()?.trim(),
    category: $(".komik_info-content .komik_info-content-info-type a")?.text()?.trim(),
    creator: $(".komik_info-content > div.komik_info-content-body > div > span:nth-child(2)")?.text()?.trim().replace(/Author:\n/g, "") || "*Unknow",
    status: $("div.komik_info-content div.komik_info-content-body div span:nth-child(3)")?.text()?.trim().replace(/Status:\n/g, ""),
    synopsis: $(".komik_info-description div p:nth-child(1)")?.text()?.trim(),
    genre: listgenre,
    totalchapter: listchapter.length,
    chapter: listchapter.sort((a, b) => a.key - b.key)
  }
}

async function Manga_Read({ slug, search, length = 0 }) {
  const detail = await Manga_Detail({ slug })
  const getChapter = (typeof search == "string" && search.length > 7)? detail.chapter?.filter(a => !!a.slug.match(search))[0]?.key || 0 : isNaN(length)? 0 : Number(length)
  const lengthView = getChapter
  if(detail.notFound) {
    return { notFound: true }
  }
  if(Number(length) > (detail.totalchapter - 1)) {
    return {
      message: "This chapter has end",
      title: detail.title,
      chapter: detail.totalchapter,
      islast: true,
      image: []
    }
  }
  const data = await RequestApi(`${baseURL.read}${detail.chapter[lengthView].slug}/`)
  const $ = cheerio.load(data.data)
  let list_image = []
  $(".main-reading-area img").each((i, el) => {
    list_image.push($(el).attr("src"))
  })

  return {
    detail: {
      slug: detail.chapter[lengthView].slug,
      openweb: `${baseURL.read}${detail.chapter[lengthView].slug}/`
    },
    title: detail.title,
    chapter: lengthView+1,
    islast: length > (detail.totalchapter - 2),
    image: list_image
  }
}

module.exports = {
  Manga_Recommend,
  Manga_Search,
  Manga_Genre,
  Manga_Detail,
  Manga_Read
}