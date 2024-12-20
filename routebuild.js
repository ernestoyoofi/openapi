const fs = require("fs")
const route = require("express").Router()

const komiku = require("./lib/komiku.js")
const komikcast = require("./lib/komikcast.js")
const mangakuio = require("./lib/mangaku.js")
const maid = require("./lib/maid.js")
const bmkg = require("./lib/bmkg.js")
const ssstik = require("./lib/ssstik.js")
const samehadaku = require("./lib/samehadaku.js")

const codeStatus = {
  notFound: {
    status: 404,
    message: "Not Found"
  },
  badResponded: {
    status: 400,
    message: "More server only responses error"
  },
  notValid: {
    status: 402,
    message: "Fulfill the Requirements in the Documentation"
  },
  notAccpted: {
    status: 406,
    message: "Access Limitations For You"
  },
  internalError: {
    status: 500,
    message: "Internal Server Error"
  },
}
const searchCode = (data) => {
  for(let a of Object.keys(codeStatus)) {
    if(Object.keys(data).indexOf(a) != -1) return a
  }
}
const responQuick = (request, req, res) => {
  const searchcode = searchCode(request)
  const status = codeStatus[searchcode]?.status || request?.statusRespon || 200
  const message = codeStatus[searchcode]?.message || request?.message || undefined

  if(searchcode) {
    return res.status(status).json({
      status: status,
      message: message
    })
  }

  if(Array.isArray(req.addRespon?.header)) {
    for(const head of req.addRespon.header) {
      res.setHeader(head.key, head.value)
    }
  }

  if(Object.keys(request).includes("redirect_uri")) {
    return res.status(301).redirect(request.redirect_uri)
  }

  return res.status(status).json({
    status: status,
    message: message,
    data: {
      ...request,
      statusRespon: undefined,
      message: undefined,
      addRespon: undefined,
    }
  })
}

/// # --- [ KOMIKU ID ] ---
route.get("/komiku.id", async (req, res) => {
  try {
    const params = { length: req.query.length }
    const request = await komiku.Manga_Recommend(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komiku.id/search", async (req, res) => {
  try {
    const params = {
      query: req.query.q,
      length: req.query.length
    }
    const request = await komiku.Manga_Search(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komiku.id/genre/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.length
    }
    const request = await komiku.Manga_Genre(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komiku.id/manga/:slug", async (req, res) => {
  try {
    const params = { slug: req.params.slug }
    const request = await komiku.Manga_Detail(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komiku.id/manga/:slug/read", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.next,
      search: req.query.search
    }
    const request = await komiku.Manga_Read(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
/// # ---- [ MAID.MY.ID ] ----
route.get("/maid.my.id", async (req, res) => {
  try {
    const params = { length: req.query.length }
    const request = await maid.Manga_Recommend(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/maid.my.id/search", async (req, res) => {
  try {
    const params = {
      query: req.query.q,
      length: req.query.length
    }
    const request = await maid.Manga_Search(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/maid.my.id/genre/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.length
    }
    const request = await maid.Manga_Genre(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/maid.my.id/manga/:slug", async (req, res) => {
  try {
    const params = { slug: req.params.slug }
    const request = await maid.Manga_Detail(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/maid.my.id/manga/:slug/read", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.next,
      search: req.query.search,
      password: req.query.password // Need password if you want show Doujin
    }
    const request = await maid.Manga_Read(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})

/// # ---- [ KOMIKCAST.CZ ] ----
route.get("/komikcast.cz", async (req, res) => {
  try {
    const params = {
      length: req.query.length
    }
    const request = await komikcast.Manga_Recommend(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komikcast.cz/search", async (req, res) => {
  try {
    const params = {
      query: req.query.q,
      length: req.query.length,
    }
    const request = await komikcast.Manga_Search(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komikcast.cz/genre/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.length,
    }
    const request = await komikcast.Manga_Genre(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komikcast.cz/manga/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug
    }
    const request = await komikcast.Manga_Detail(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/komikcast.cz/manga/:slug/read", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.next,
      search: req.query.search,
    }
    const request = await komikcast.Manga_Read(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
/// # ---- [ MANGAKU.IO ] ----
route.get("/mangaku.io", async (req, res) => {
  try {
    const params = {
      length: req.query.length
    }
    const request = await mangakuio.Manga_Recommend(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/mangaku.io/search", async (req, res) => {
  try {
    const params = {
      query: req.query.q,
      length: req.query.length,
    }
    const request = await mangakuio.Manga_Search(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/mangaku.io/genre/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.length,
    }
    const request = await mangakuio.Manga_Genre(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/mangaku.io/manga/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug
    }
    const request = await mangakuio.Manga_Detail(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/mangaku.io/manga/:slug/read", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
      length: req.query.next,
      search: req.query.search,
    }
    const request = await mangakuio.Manga_Read(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
/// # ---- [ BMKG ] ----
route.get("/bmkg/cuaca/:slug/areaonly", async (req, res) => {
  try {
    const params = {
      provinsi: req.params.slug,
      onlyAreaReturn: true
    }
    const request = await bmkg.APICuaca(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
}) 
route.get("/bmkg/cuaca/:slug/info", async (req, res) => {
  try {
    const params = {
      provinsi: req.params.slug,
      areacode: req.query.areacode
    }
    const request = await bmkg.APICuaca(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
/// # ---- [ SAMEHADAKU ] ----
route.get("/samehadaku", async (req, res) => {
  try {
    const params = {
      length: req.query.length,
    }
    const request = await samehadaku.RecommendStreaming(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/samehadaku/search", async (req, res) => {
  try {
    const params = {
      query: req.query.q,
      length: req.query.length,
    }
    const request = await samehadaku.SearchStreaming(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/samehadaku/genre", async (req, res) => {
  try {
    const params = {
      slug: req.query.slug,
      length: req.query.length,
    }
    const request = await samehadaku.SearchByGenre(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/samehadaku/detail/:slug", async (req, res) => {
  try {
    const params = {
      slug: req.params.slug,
    }
    const request = await samehadaku.GetDetailStreaming(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/samehadaku/detail/:slug/view", async (req, res) => {
  try {
    const params = {
      next: req.query.next,
      slug: req.params.slug,
    }
    const request = await samehadaku.GetListStreamingSource(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
route.get("/samehadaku/streaming-source", async (req, res) => {
  try {
    const params = {
      postId: req.query.postId,
      num: req.query.num,
    }
    const request = await samehadaku.GetUrlWebStreaming(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})
/// # ---- [ SSSTIK.IO ] ----
route.get("/ssstik/info", async (req, res) => {
  try {
    const params = { url: req.query.url }
    const request = await ssstik.GetInfoDownload(params)
    return responQuick(request, req, res)
  } catch(err) {
    console.log(`[URL ${req.url}]:`,err)
    return res.status(codeStatus.internalError.status).json(codeStatus.internalError)
  }
})

/// OTHERS
route.get("/:hosted/manga/:slug/read/view-web", (req, res) => {
  console.log(req)
  res.send(
    fs.readFileSync(`${process.cwd()}/page/manga-reveal.html`,"utf-8")
    .replaceAll("$HOSTED", req.params?.hosted)
    .replaceAll("$SLUGREAD", req.params?.slug)
    .replaceAll("--BACKGROUND", req.query?.colorbg?.replace("hash","#") || "")
    .replaceAll("--COLORTEXT", req.query?.colortx?.replace("hash","#") || "")
  )
})

module.exports = route