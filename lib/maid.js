const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")

const baseURL = {
  recommend: "https://www.maid.my.id/", // Recommend
  genre: "https://www.maid.my.id/genres/", // Genre 
  search: "https://www.maid.my.id/", // Search
  detail: "https://www.maid.my.id/manga/", // Info Manga
  read: "https://www.maid.my.id/" // Readable
}

async function Manga_Recommend({ length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  const url = isNextNum === 1? baseURL.recommend : `${baseURL.recommend}page/${isNextNum}`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $("main .container .flexbox4 .flexbox4-item").each((i, el) => {
    list.push({
      image: $("img", el).eq(0)?.attr("src"),
      title: $(".flexbox4-side .title a", el)?.text()?.trim(),
      desc: $(".flexbox4-side .title a", el)?.text()?.trim(),
      view: "NaN",
      update: $("span", $("ul li", el).eq(0))?.text()?.trim(),
      slug: $("a", el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })
  return {
    page: isNextNum,
    next: !!$(".pagination .next.page-numbers").attr("href"),
    list
  }
}

async function Manga_Search({ query, length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  if(!query?.trim()) {
    await new Promise((a) => setTimeout(a,550))
    return { notValid: true }
  }
  const url = isNextNum === 1? baseURL.recommend : `${baseURL.recommend}page/${isNextNum}`
  const data = await RequestApi(url+`?${new URLSearchParams({
    s: query
  })}`)
  const $ = cheerio.load(data.data)

  let list = []
  $(".flexbox2 .flexbox2-item").each((i, el) => {
    let genreList = []
    $(".genres a", el).each((o, cx) => {
      genreList.push({
        label: $(cx)?.text()?.trim(),
        slug: $(cx)?.text()?.trim()?.toLowerCase()?.replace(/ /g, "-"),
      })
    })

    list.push({
      image: $("img", el).eq(0)?.attr("src"),
      title: $(".flexbox2-title .title", el)?.text()?.trim(),
      desc: $(".flexbox2-side .synops p", el)?.text()?.trim(),
      rate: $(".flexbox2-side .info .score", el)?.text()?.trim(),
      genre: genreList,
      update: $("span", $("ul li", el).eq(0))?.text()?.trim(),
      slug: $("a", el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })

  return {
    page: isNextNum,
    next: !!$(".pagination .next.page-numbers").attr("href"),
    list,
  }
}

async function Manga_Genre({ slug, length }) {
  const isNextNum = isNaN(length)? 1 : Number(length) === 0? 1 : Number(length)+1
  const querySelect = slug?.toLowerCase()?.replace(/-/g, "-")
  const url = isNextNum === 1? `${baseURL.genre}/${querySelect}`:`${baseURL.genre}/${querySelect}/page/${isNextNum}/`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let list = []
  $(".flexbox2 .flexbox2-item").each((i, el) => {
    let genreList = []
    $(".genres a", el).each((o, cx) => {
      genreList.push({
        label: $(cx)?.text()?.trim(),
        slug: $(cx)?.text()?.trim()?.toLowerCase()?.replace(/ /g, "-"),
      })
    })

    list.push({
      image: $("img", el).eq(0)?.attr("src"),
      title: $(".flexbox2-title .title", el)?.text()?.trim(),
      desc: $(".flexbox2-side .synops p", el)?.text()?.trim(),
      rate: $(".flexbox2-side .info .score", el)?.text()?.trim(),
      genre: genreList,
      update: $("span", $("ul li", el).eq(0))?.text()?.trim(),
      slug: $("a", el).eq(0).attr("href")?.split("manga/")[1]?.split("/")[0]?.trim()
    })
  })

  return {
    page: isNextNum,
    next: !!$(".pagination .next.page-numbers").attr("href"),
    list,
  }
}

async function Manga_Detail({ slug }) {
  const url = `${baseURL.detail}${slug}`
  const data = await RequestApi(url)
  if(data.status != 200) {
    return { notFound: true }
  }
  const $ = cheerio.load(data.data)
  let listchapter = []
  let listgenre = []

  $(".series-genres a").each((i, el) => {
    listgenre.push({
      label: $(el)?.text()?.trim(),
      slug: $(el)?.text()?.trim()?.toLowerCase()?.replace(/ /g, "-"),
    })
  })
  $(".series-chapterlist li").each((i, el) => {
    listchapter.push({
      key: $(".series-chapterlist li").length - i - 1,
      ch: $(".flexch-infoz a", el)?.text()?.trim()?.replace($(".flexch-infoz a .date", el)?.text()?.trim(), ""),
      seris_date: $(".flexch-infoz a .date", el)?.text()?.trim(),
      slug: $(".flexch-infoz a", el)?.attr("href")?.split("/")[3]
    })
  })

  const isRestricted = $(".series-infoz .type").eq(0)?.text()?.trim()?.toLowerCase() === "doujin"

  return {
    cover: $(".series-thumb img").eq(0)?.attr("src"),
    title: `${isRestricted? "(Restricted !) ":""}${$(".series-title h2").eq(0)?.text()?.trim()}`,
    category: $(".series-infoz .type").eq(0)?.text()?.trim(),
    status: $(".series-infoz .status").eq(0)?.text()?.trim(),
    synopsis: $(".series-synops p").text().trim(),
    genre: listgenre,
    totalchapter: listchapter.length,
    chapter: listchapter.sort((a, b) => a.key - b.key)
  }
}

async function Manga_Read({ slug, length = 0}) {
  const detail = await Manga_Detail({ slug })
  const lengthView = isNaN(length)? 0 : Number(length)
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
  const data = await RequestApi(`${baseURL.read}${detail.chapter[lengthView].slug}/`, {
    headers: {
      "Cookie": "wp-postpass_94baa28282982610a836ea6f9f7de82b=%24P%24BYD4EWRMD6rof0cz8Vhuswo1rsupu8."
    }
  })
  const $ = cheerio.load(data.data)
  let list_image = []
  $(".container .reader-area img").each((i, el) => {
    list_image.push($(el).attr("src"))
  })
  let ts = {}
  if($("form")?.attr("action") && !list_image[0]) {
    ts = {
      "$__exec_url": [
        {
          title: "Isi password untuk membuka konten batasan",
          requestcontent: {
            method: "POST",
            url: $("form").attr("action"),
            body: {
              post_password: "",
              submit: "Masukkan"
            }
          }
        }
      ]
    }
  }
  return {
    title: detail.title,
    chapter: lengthView+1,
    islast: length > (detail.totalchapter - 2),
    image: list_image,
    ...ts
  }
}

module.exports = {
  Manga_Recommend,
  Manga_Search,
  Manga_Genre,
  Manga_Detail,
  Manga_Read
}