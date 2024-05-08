const express = require("express")
const cookieParser = require("cookie-parser")

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(require("./headingmod"))
app.use(require("./routebuild"))
app.use((req, res) => {
  res.status(406).json({
    status: 406,
    message: "Not Acceptable, check documentation"
  })
})
app.listen(port, () => {
  console.log(`[Server Listen]: http://localhost:${port}`)
})