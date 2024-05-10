function Headingmod(req, res, next) {
  console.log(`[Request Client]: [${req.method}] ${req.url}`)
  res.setHeader("X-Powered-By","OpenAPI")
  res.setHeader("X-Repository-Github","https://github.com/ernestoyoofi/openapi")
  next()
}

module.exports = Headingmod