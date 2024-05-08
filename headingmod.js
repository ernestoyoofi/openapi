function Headingmod(req, res, next) {
  res.setHeader("X-Powered-By","Open API / Ernestoyoofi")
  next()
}

module.exports = Headingmod