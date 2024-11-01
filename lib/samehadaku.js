const { RequestApi } = require("./request/httpdebugger")
const cheerio = require("cheerio")
const nextpage = require("./more/nextpage")
const filterstg = require("./more/filters-string")

const globalURL = {
  home: "https://samehadaku.email/anime-terbaru/",
  search: "https://samehadaku.email/",
  genre: "https://samehadaku.email/genre/",
  detail: "https://samehadaku.email/anime/",
  watch: "https://samehadaku.email/",
  streaming: "https://samehadaku.email/wp-admin/admin-ajax.php"
}

async function RecommendStreaming({ length } = {}) {
  const url = globalURL.home + nextpage.GetNextPagePath(length)
  const data = await RequestApi(url)
  // console.log(data.data)
  const $ = cheerio.load(data.data)

  let listwatch = []
  $("#container #main ul li").each((i, el) => {
    listwatch.push({
      thumb: $(".thumb img",el).attr("src"),
      title: $(".dtla h2",el).text()?.trim(),
      episode: $($(".dtla span author", el).eq(0)).text()?.trim(), // Optional
      author: $($(".dtla span author", el).eq(1)).text()?.trim(), // Optional
      release: $($(".dtla span", el).eq(2)).text()?.split(":")[1]?.trim()?.replace(/days/g, "hari"), // Optional
      slug: new URL($(".thumb a", el).attr("href")).pathname.split("/")[1]?.split("-episode")[0],
      type: "cardlisted"
    })
  })

  return {
    isNext: !!$("a.arrow_pag").text(),
    page: nextpage.GetNextPage(length),
    list: listwatch
  }
}

async function SearchStreaming({ query, length }) {
  const querys = filterstg(query)
  if(!querys) {
    return {
      message: "Not Found",
      isNext: false,
      page: 0,
      list: []
    }
  }
  const url = globalURL.search + nextpage.GetNextPagePath(length) + `?${new URLSearchParams({ s: querys })}`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let listwatch = []
  $("#main article .animepost").each((i, el) => {
    let genres = []
    $(".genres .mta a", el).each((ii, rk) => {
      genres.push({
        label: $(rk).text()?.trim(),
        slug: new URL($(rk).attr("href")).pathname.split("/")[2]
      })
    })
    listwatch.push({
      thumb: $(".animposx img", el).attr("src"),
      status: $(".animposx .data .type", el).text()?.trim(),
      title: $(".stooltip .title h4", el).text()?.trim(),
      desc: $(".stooltip .ttls", el).text()?.trim(),
      genres: genres,
      score: $(".metadata .skor", el).text()?.trim(),
      slug: new URL($(".animposx a", el).attr("href")).pathname.split("/")[2],
      type: "cardcover"
    })
  })

  return {
    isNext: !!$("a.arrow_pag").text(),
    page: nextpage.GetNextPage(length),
    list: listwatch
  }
}

async function SearchByGenre({ slug, length } = {}) {
  const querys = filterstg(slug)
  if(!querys) {
    return {
      message: "Not Found",
      isNext: false,
      page: 0,
      list: []
    }
  }
  const url = globalURL.genre + `${slug}/` + nextpage.GetNextPagePath(length)
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)

  let listwatch = []
  $("#main article .animepost").each((i, el) => {
    let genres = []
    $(".genres .mta a", el).each((ii, rk) => {
      genres.push({
        label: $(rk).text()?.trim(),
        slug: new URL($(rk).attr("href")).pathname.split("/")[2]
      })
    })
    listwatch.push({
      thumb: $(".animposx img", el).attr("src"),
      status: $(".animposx .data .type", el).text()?.trim(),
      title: $(".stooltip .title h4", el).text()?.trim(),
      desc: $(".stooltip .ttls", el).text()?.trim(),
      genres: genres,
      score: $(".metadata .skor", el).text()?.trim(),
      slug: new URL($(".animposx a", el).attr("href")).pathname.split("/")[2],
      type: "cardcover"
    })
  })

  return {
    isNext: !!$("a.arrow_pag").text(),
    page: nextpage.GetNextPage(length),
    list: listwatch
  }
}

async function GetDetailStreaming({ slug }) {
  const url = globalURL.detail + `${slug}/`
  const data = await RequestApi(url)
  if(data.status != 200) {
    return { notFound: true }
  }
  const $ = cheerio.load(data.data)

  let producers = []
  let episode = []

  $(".anim-senct .right-senc.widget_senction span:nth-child(11) a").each((i, el) => {
    producers.push($(el).text()?.trim())
  })
  const epsDiv = $(".whites.lsteps.widget_senction .lstepsiode.listeps > ul li")
  epsDiv.each((i, el) => {
    episode.push({
      key: epsDiv.length - Number(i),
      label: $(".epsleft .lchx a", el).text()?.trim()?.replace(/\n/g, ""),
      date: $(".epsleft .date", el).text()?.trim()?.replace(/\n/g, ""),
      slug: new URL($(".epsleft .lchx a", el).attr("href")).pathname.split("/")[1]
    })
  })

  return {
    image: $(".infoanime.widget_senction .thumb img").attr("src"),
    title: $("head title").text()?.trim()?.split("- Samehadaku")[0]?.trim(),
    desc: $(".infoanime.widget_senction .infox .desc").text()?.trim(),
    status: $(".anim-senct .right-senc.widget_senction span:nth-child(4)").text()?.replace(/Status/,"")?.trim(),
    trailer: $(".trailer-anime #embed_holder iframe").attr("src"),
    season: $(".anim-senct .right-senc.widget_senction span:nth-child(9) a").text()?.trim(),
    producers: producers,
    // release: $("").text()?.trim(),
    episode: episode
  }
}

async function GetListStreamingSource({ slug, next }) {
  const getIndexKey = nextpage.GetNextPage(next)
  const listDetail = await GetDetailStreaming({ slug })
  const getKeys = listDetail.episode.filter(a => a.key == getIndexKey)
  
  if(!getKeys[0]?.slug) {
    return {
      notFound: true
    }
  }
  const url = globalURL.watch + `${getKeys[0].slug}/`
  const data = await RequestApi(url)
  const $ = cheerio.load(data.data)
  
  let stream = []
  $(".server_option ul li").each((i, el) => {
    stream.push({
      postId: $("div", el).attr("data-post"),
      num: $("div", el).attr("data-nume"),
      type: $("div", el).attr("data-type"),
      label: $(el).text()?.trim()
    })
  })
  return {
    image: listDetail.image,
    desc: listDetail.desc,
    episode: getIndexKey,
    stream: stream
  }
}

async function GetUrlWebStreaming({ postId, num }) {
  const data = await RequestApi(globalURL.streaming, {
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    body: `action=player_ajax&post=${postId}&nume=${num}&type=schtml`
  })
  const $ = cheerio.load(data.data)

  return {
    redirect_uri: $("iframe").attr("src")
  }
}

module.exports = {
  RecommendStreaming,
  SearchStreaming,
  SearchByGenre,
  GetDetailStreaming,
  GetListStreamingSource,
  GetUrlWebStreaming
}