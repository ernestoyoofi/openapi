// const { RequestApi } = require("./request/reqbin")
const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")

const baseURL = {
  recommend: "https://api.komiku.id/other/rekomendasi/", // Recommend Page
  genre: "https://api.komiku.id/genre", // Genre
  search: "https://api.komiku.id/", // Search
  detail: "https://komiku.id/manga/", // View Details
  read: "https://komiku.id/ch/" // Read / View Comic
}

async function Manga_Recommend({ length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  const url = isNextNum === 1? `${baseURL.recommend}`:`${baseURL.recommend}page/${isNextNum}/`
  const data = await RequestApi(url)
  //console.log(data.data)
  const $ = cheerio.load(data.data)

  let list = []
  $("div.bge").each((i, el) => {
    list.push({
      image: $("img",el).eq(0)?.attr("src"),
      title: $(".kan a h3", el).text()?.trim(),
      desc: $(".kan p",el).text().trim(),
      view: $(".kan .judul2",el).text()?.split("•")[0]?.trim(),
      update: $(".kan .judul2",el).text()?.split("•")[1]?.trim(),
      slug: $("a",el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })

  return {
    page: isNextNum,
    next: !!$('span[hx-get]').attr("hx-get"),
    list,
  }
}

async function Manga_Search({ query, length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  const url = isNextNum === 1? `${baseURL.search}`:`${baseURL.search}/page/${isNextNum}/`
  if(!query?.trim()) {
    await new Promise((a) => setTimeout(a, 500))
    return {
      notValid: true,
      message: "Please, enter your query",
    }
  }
  const data = await RequestApi(url+`?${new URLSearchParams({
    post_type: "manga",
    s: query
  }).toString()}`)
  const $ = cheerio.load(data.data)

  let list = []
  $("div.bge").each((i, el) => {
    list.push({
      image: $("img",el).eq(0)?.attr("src"),
      title: $(".kan a h3", el).text()?.trim(),
      desc: $(".kan p",el).text()?.split(".")[1]?.trim(),
      update: $(".kan p",el).text()?.split(".")[0]?.trim(),
      slug: $("a",el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })

  return {
    page: isNextNum,
    next: !!$('span[hx-get]').attr("hx-get"),
    list,
  }
}

async function Manga_Genre({ slug, length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  const querySelect = slug?.toLowerCase()?.replace(/-/g, "-")
  const url = isNextNum === 1? `${baseURL.genre}/${querySelect}`:`${baseURL.genre}/${querySelect}/page/${isNextNum}/`
  const data = await RequestApi(url)
  //console.log(data.data)
  const $ = cheerio.load(data.data)

  let list = []
  $("div.bge").each((i, el) => {
    list.push({
      image: $("img",el).eq(0)?.attr("src"),
      title: $(".kan a h3", el).text()?.trim(),
      desc: $(".kan p",el).text().trim(),
      view: $(".kan .judul2",el).text()?.split("•")[0]?.trim(),
      update: $(".kan .judul2",el).text()?.split("•")[1]?.trim(),
      slug: $("a",el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })

  return {
    page: isNextNum,
    next: !!$('span[hx-get]').attr("hx-get"),
    list,
  }
}

async function Manga_Detail({ slug }) {
  const data = await RequestApi(baseURL.detail+slug)
  if(data.status != 200) {
    return {
      notFound: true
    }
  }
  const $ = cheerio.load(data.data)
  let list = []
  let listGenre = []
  let pictureChar = []
  $("main #Chapter table tr").each((i, el) => {
    if(!$("a", el).attr("href")) return ;
    list.push({
      ch: $("td", el).eq(0).text().trim(),
      series_date: $("td", el).eq(1).text().trim(),
      slug: $("a", el).attr("href").replace("/ch/", "")?.split("/")[0]
    })
  })
  $("main #Informasi .genre li").each((i, el) => {
    listGenre.push($(el).text().trim())
  })
  $("main #Sinopsis .lsf img").each((i, el) => {
    if($(el).attr("src")) {
      pictureChar.push($(el).attr("src"))
    }
  })
  let listNt = []
  for(let i in [...Array(list.length)]) {
    const ctx = (list.length-1) - Number(i)
    listNt.push({
      key: Number(i),
      ...list[ctx]
    })
  }
  return {
    cover: $("main #Informasi img").eq(0).attr("src"),
    title: $("main #Judul h1").text().trim(),
    subtitle: $("main #Judul p.j2").text().trim(),
    category: $("td", $("main #Informasi table tr").eq(2)).eq(1).text().trim(),
    storyconcept: $("td", $("main #Informasi table tr").eq(3)).eq(1).text(),
    creator: $("td", $("main #Informasi table tr").eq(4)).eq(1).text(),
    status: $("td", $("main #Informasi table tr").eq(5)).eq(1).text(),
    synopsis: $("main #Judul p.desc").text().trim().replace(/\t/g, ""),
    genre: listGenre,
    character: pictureChar,
    totalchapter: list.length,
    chapter: listNt,
  }
}

async function Manga_Read({ slug, length = 0 }) {
  const ifg = await Manga_Detail({ slug })
  const iLg = isNaN(length)? 0 : Number(length)
  if(ifg.notFound) {
    return {
      notFound: true
    }
  }
  if(iLg > (ifg.totalchapter-1)) {
    return {
      message: "This chapter has end",
      title: ifg.title,
      subtitle: ifg.subtitle,
      chapter: ifg.totalchapter,
      islast: true,
      image: []
    }
  }
  const data = await RequestApi(baseURL.read+`${ifg.chapter[iLg].slug}/`)
  const $ = cheerio.load(data.data)
  // console.log(data.data, iLg)
  let list_image = []
  // console.log("Parseing", $("#Baca_Komik img").length, $("html").html())
  $("#Baca_Komik img").each((i, el) => {
    list_image.push($(el).attr("src"))
  })
  return {
    title: ifg.title,
    subtitle: ifg.subtitle,
    chapter: iLg+1,
    islast: false,
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