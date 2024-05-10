/**
  # --- [ WARNING ] ---

  THIS SCRIPT IS NOT ORIGINAL FROM THE SITE, BUT RATHER A WAY TO GET HTTP CONTENT ON THE SITE AS A PROXY SITE SO THAT IT CAN DO WHAT WE WANT, IN THIS CASE WE WANT TO BYPASS THE DDOS SYSTEM SO THAT WE CAN DO SCRAPPING, BUT SOME SITES WILL NOT WORK.
*/

const axios = require("axios")
const cheerio = require("cheerio")
const nativeURL = "https://www.httpdebugger.com/tools/ViewHttpHeaders.aspx"
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Origin": "https://reqbin.com",
  "Content-Type": "",
  "Sec-Ch-Ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
  "Sec-Ch-Ua-Platform": "\"Windows\"",
  "Sec-Ch-Ua-Mobile": "?0",
  "Dnt": "1",
  "Expires": "0",
  "Content-Type": "application/x-www-form-urlencoded"
}

async function RequestApi(url, options) {
  try {
    let CostumHeader = ""
    if(options?.headers) {
      Object.keys(options.headers).forEach(a => {
        CostumHeader += `\n${a}: ${options.headers[a]}`
      })
    }
    const formPost = new URLSearchParams({
      UrlBox: encodeURI(url),
      ContentTypeBox: options?.contentType || "",
      ContentDataBox: options?.body || "",
      HeadersBox: CostumHeader,
      RefererBox: options?.referer || "",
      AgentList: "Google Chrome",
      AgentBox: "",
      VersionsList: "HTTP/1.1",
      MethodList: options?.method || "GET"
    }).toString()
    const results = (await axios.post(nativeURL, formPost, { headers })).data
    const $ = cheerio.load(results)
    if(!$("#resultSection").attr("id")) {
      if(!$(".statuserr").html()) {
        return Promise.reject(new Error("Can't Resolve Because Not Respon!"))
      }
      return {
        headers: {},
        status: Number($("#ResultData .statuserr").text().split("(")[1].replace(/\D+$/g, "")),
        contentType: "text/html",
        data: ""
      }
    }
    let resultsHeader = {}
    $("#content > div > div > div > div:nth-child(4) > div > div:nth-child(4) > div.row.tools-table").each((i, el) => {
      resultsHeader[$(".col-sm-2", el).text().trim()] = $(".col-sm-10", el).text().trim()
    })
    return {
      headers: resultsHeader,
      status: Number($("#content > div > div > div > div:nth-child(4) > div > div:nth-child(4) > strong").text().replace(/\D/g, "")),
      contentType: resultsHeader["Content-Type"],
      data: $("#ResultData pre").text()
    }
  } catch(err) {
    console.log("Some Error In Try Request", err)
    return Promise.reject(new Error("Can't Resolve This Request!"))
  }
}

module.exports = {
  RequestApi
}