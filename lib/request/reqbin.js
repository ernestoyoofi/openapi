/**
  # --- [ WARNING ] ---

  THIS SCRIPT IS NOT ORIGINAL FROM THE SITE, BUT RATHER A WAY TO GET HTTP CONTENT ON THE SITE AS A PROXY SITE SO THAT IT CAN DO WHAT WE WANT, IN THIS CASE WE WANT TO BYPASS THE DDOS SYSTEM SO THAT WE CAN DO SCRAPPING, BUT SOME SITES WILL NOT WORK.
*/

const axios = require("axios")
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Origin": "https://reqbin.com",
  "Content-Type": "",
  "Sec-Ch-Ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
  "Sec-Ch-Ua-Platform": "\"Windows\"",
  "Sec-Ch-Ua-Mobile": "?0",
  "Dnt": "1",
  "Cache-Control": "",
  "Pragma": "",
  "Expires": "0",
  "X-Authorized": "",
  "X-Token": "",
  "X-SesId": new Date().getTime(), // Require
  "X-DevId": require("uuid").v4() // Require
}
const nativeURL = "https://apius.reqbin.com/api/v1/requests"
const dataBuilder = {
  id: "0",
  name: "",
  errors: "",
  sessionId: headers["X-SesId"], // Require
  deviceId: headers["X-DevId"], // Require
  json: "ReplaceThisContentToRequest"
}

async function RequestApi(url, options) {
  console.log("[Request To Reqbin]", { url, options })
  let CostumHeader = ""
  if(options?.headers) {
    Object.keys(options.headers).forEach(a => {
      CostumHeader += `\n${a}: ${options.headers[a]}`
    })
  }
  const opt = {
    url: encodeURI(url),
    idnUrl: encodeURI(url),
    method: options?.method || "GET",
    apiNode: options?.apiNode || "US",
    contentType: options?.contentType || "",
    content: options?.body,
    headers: CostumHeader.trim(),
    errors: '',
    curlCmd: '',
    codeCmd: '',
    jsonCmd: '',
    xmlCmd: '',
    lang: '',
    compare: false,
    auth: {
      auth: 'noAuth',
      'bearer Token': '',
      basicUsername: '',
      basicPassword: '',
      customHeader: '',
      encrypted: ''
    },
  }

  let clsOpen = dataBuilder
  clsOpen.json = JSON.stringify(opt)

  try {
    const results = (await axios.post(nativeURL, clsOpen, { headers })).data
    if(Number(results.StatusCode) === 0) {
      return Promise.reject(new Error("Oprator timeout !"))
    }
    return {
      //results,
      headers: results.Headers,
      status: Number(results.StatusCode),
      contentType: results.ContentType?.split(";")[0],
      data: results.Content
    }
  } catch(err) {
    console.log("Some Error In Try Request", err)
    return Promise.reject(new Error("Can't Resolve This Request!"))
  }
}

module.exports = {
  RequestApi
}