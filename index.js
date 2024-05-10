const timeStart = new Date().getTime()
const express = require("express")
const cookieParser = require("cookie-parser")

const port = process.env.PORT || 3000
const app = express()

const modhead = require("./headingmod")
const apiregister = require("./routebuild")

app.use(express.json())
app.use(cookieParser())
app.use(modhead)
app.use(apiregister)
app.use((req, res) => {
  res.status(406).json({
    status: 406,
    message: "Not Acceptable, check documentation"
  })
})
app.listen(port, () => {
  console.log(`\n  [Start Server Listening]\n\n • URL      : http://localhost:${port}\n • Register : ${apiregister.stack.length} API\n • Load Js  : ${(new Date().getTime()-timeStart)/1000} ms\n`)
})