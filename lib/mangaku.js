const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")

const baseURL = {
  recommend: "https://mangaku.io/", // Recommend
  genre: "https://mangaku.io/genres/", // Genre 
  search: "https://mangaku.io/", // Search
  detail: "https://mangaku.io/manga/", // Info Manga
  read: "https://mangaku.io/", // Readable
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
  const url = `${baseURL.recommend}${getInts}`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $("div.postbody div div.listupd .utao").each((i, el) => {
    list.push({
      image: $(".imgu img", el).eq(0).attr("src"),
      title: $(".luf h4", el).eq(0)?.text()?.trim(),
      desc: $(".luf h4", el).eq(0)?.text()?.trim(),
      rec: $("ul li a", el).eq(0).attr("href")? {
        label: $("ul li a", el).eq(0).text().trim(),
        slug: $("ul li a", el).eq(0).attr("href")? new URL($("ul li a", el).eq(0).attr("href")).pathname.split("/")[1] : "",
        update: $("ul li span", el).eq(0)?.text()?.trim() || ""
      } : undefined,
      slug: new URL($(".series", el).attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$("#content .hpage a.r").eq(0)?.text(),
    list: list
  }
}

async function Manga_Search({ query, length }) {
  const getInts = nextingPages(length)
  const url = `${baseURL.search}${getInts}?s=${query}`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".postbody .listupd .bs").each((i, el) => {
    list.push({
      image: $("img", el).eq(0).attr("src"),
      title: $(".bsx .bigor .tt", el).eq(0)?.text()?.trim(),
      desc: $(".bsx .bigor .tt", el).eq(0)?.text()?.trim(),
      rate: $(".rating .numscore", el).text()?.trim().slice(0,1)+".00",
      slug: new URL($(".bsx a", el).attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$(".postbody .pagination a.next.page-numbers").text(),
    list: list,
  }
}

async function Manga_Genre({ slug, length }) {
  const getInts = nextingPages(length)
  const url = `${baseURL.genre}${slug}/${getInts}`
  console.log(url)
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".postbody .listupd .bs").each((i, el) => {
    list.push({
      image: $("img", el).eq(0).attr("src"),
      title: $(".bsx .bigor .tt", el).eq(0)?.text()?.trim(),
      desc: $(".bsx .bigor .tt", el).eq(0)?.text()?.trim(),
      rate: $(".rating .numscore", el).text()?.trim().slice(0,1)+".00",
      slug: new URL($(".bsx a", el).attr("href")).pathname.split("/")[2]
    })
  })

  return {
    page: numberingPages(length),
    next: !!$(".postbody .pagination a.next.page-numbers").text(),
    list: list
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

  $(".mgen a", $(".main-info .wd-full").eq(0)).each((i, el) => {
    listgenre.push({
      label: $(el)?.text()?.trim(),
      slug: $(el)?.text()?.trim().toLowerCase()?.replace(/ /g, "-"),
    })
  })
  $("#chapterlist ul li").each((i, el) => {
    listchapter.push({
      key: $("#chapterlist ul li").length - i - 1,
      ch: $("a .chapternum", el)?.text()?.trim()?.replace(/\n/," "),
      seris_date: $("a .chapterdate", el)?.text()?.trim(),
      slug: new URL($("a", el).attr("href")).pathname.split("/")[1]
    })
  })

  return {
    cover: $(".main-info .thumb img").eq(0).attr("src"),
    title: $(".main-info h1.entry-title").eq(0).text().trim(),
    category: $("a", $(".main-info .tsinfo .imptdt").eq(1))?.text()?.trim(),
    creator: $("i", $(".main-info .tsinfo .imptdt").eq(3))?.text()?.trim(),
    status: $("i", $(".main-info .tsinfo .imptdt").eq(0))?.text()?.trim(),
    rate: $(".rating .num")?.text()?.trim(),
    synopsis: $("p", $(".main-info .wd-full").eq(1)).text()?.trim(),
    genre: listgenre,
    totalchapter: listchapter.length,
    chapter: listchapter
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
  const $ = cheerio.load(data.data, { scriptingEnabled: false })
  let list_image = []
  $("#readerarea img").each((i, el) => {
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