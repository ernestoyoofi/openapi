const timeStart = new Date().getTime()
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors")
const queryFormula = require("./lib/more/query-formula")

const port = process.env.PORT || 3000
const app = express()

const modhead = require("./headingmod")
const apiregister = require("./routebuild")

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(modhead)
app.use(apiregister)
app.use("/graph-request", bodyParser.text({ type: "text/graph" }), async (req, res) => {
  if(req.method != "POST") {
    return res.status(400).json({
      message: "Method only post"
    })
  }
  if(!req.headers["content-type"]?.match("text/graph")) {
    return res.status(402).json({
      message: "Request data?, use text/graph"
    })
  }
  const dataInfo = queryFormula.parseRequestData(req.body)
  const libRequest = {
    "httpdebugger.js": require("./lib/request/httpdebugger").RequestApi,
    "reqbin.js": require("./lib/request/reqbin").RequestApi
  }
  let resultsRequest = []
  for(let nameKey of Object.keys(dataInfo)) {
    const optionKey = dataInfo[nameKey]
    const executeFetch = libRequest[optionKey.lib]
    if(!executeFetch) {
      resultsRequest.push({
        status: 400,
        name: "No request library"
      })
    } else {
      try {
        const resultfetch = await executeFetch(optionKey?.url, optionKey?.option)
        resultsRequest.push({
          data: resultfetch
        })
      } catch(err) {
        resultsRequest.push({
          status: 500,
          message: err.stack
        })
      }
    }
  }
  return res.status(200).json(resultsRequest)
})
app.use((req, res) => {
  res.status(406).json({
    status: 406,
    message: "Not Acceptable, check documentation"
  })
})
app.listen(port, () => {
  console.log(`\n  [Start Server Listening]\n\n • URL      : http://localhost:${port}\n • Register : ${apiregister.stack.length} API\n • Load Js  : ${(new Date().getTime()-timeStart)/1000} ms\n`)
})