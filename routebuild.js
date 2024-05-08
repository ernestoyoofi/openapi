const route = require("express").Router()

const codeStatus = {
  notFound: 404,
  notValid: 402,
  notAccpted: 406,
  internalError: 500,
}
const codeMessage = {
  notFound: "Not Found",
  notValid: "Fulfill the Requirements in the Documentation",
  notAccpted: "Access Limitations For You",
  internalError: "Internal Server Error"
}
const searchCode = (data) => {
  for(let a of Object.keys(codeStatus)) {
    const b = Object.keys(data).indexOf(a)
    if(b != -1) {
      return a
    }
  }
}

const listReq = [
  {
    path: "/komiku.id/",
    params: (query, params, body) => ({
      ...query
    }),
    func: require("./modules/komiku").Other_Recommend
  },
  {
    path: "/komiku.id/search",
    params: (query, params, body) => ({
      ...query
    }),
    func: require("./modules/komiku").Manga_Search
  },
  {
    path: "/komiku.id/genre/:slug",
    params: (query, params, body) => ({
      ...query,
      slug: params.slug
    }),
    func: require("./modules/komiku").Manga_Genre
  },
  {
    path: "/komiku.id/:slug/",
    params: (query, params, body) => ({
      ...query,
      slug: params.slug
    }),
    func: require("./modules/komiku").Manga_Detail
  },
  {
    path: "/komiku.id/:slug/read",
    params: (query, params, body) => ({
      ...query,
      slug: params.slug
    }),
    func: require("./modules/komiku").Manga_Read
  },
  {
    path: "/bmkg/cuaca/:slug/area",
    params: (query, params, body) => ({
      provinsi: params.slug,
      onlyAreaReturn: true
    }),
    func: require("./modules/bmkg").APICuaca
  },
  {
    path: "/bmkg/cuaca/:slug/view",
    params: (query, params, body) => ({
      provinsi: params.slug,
    }),
    func: require("./modules/bmkg").APICuaca
  }
]

listReq.forEach((a, i) => {
  if(typeof a.path != "string" || typeof a.params != "function" || typeof a.func != "function") return;
  
  route[a.method?.toLowerCase()||"get"](a.path, async (req, res) => {
    try {
      const params = a.params(req.query, req.params, req.body)
      const request = await a.func(params)
      const scCode = searchCode(request)
      const status = codeStatus[scCode] || request.statusRespon || 200
      const message = codeMessage[scCode] || request.message || undefined
      if(scCode) {
        return res.status(status).json({
          status: status,
          message: message,
          docs: request.docs,
        })
      }
      return res.status(status).json({
        status: status,
        message: message,
        data: {
          ...request,
          message: undefined,
          statusRespon: undefined,
          addRespon: undefined,
        }
      })
    }catch(err) {
      console.log(`[${a.path} Error]`, err.stack)
      res.status(500).json({
        status: 500,
        message: "Internal Server Error"
      })
    }
  })
})

module.exports = route