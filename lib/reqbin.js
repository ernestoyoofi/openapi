const axios = require("axios")

const headers = {
  "User-Agent": "WarpCurl/4.10.0"
}
const nativeURL = "https://apius.reqbin.com/api/v1/requests"
const dataBuilder = {
  id: "0",
  name: "",
  errors: "",
  sessionId: "",
  deviceId: "",
  json: "ReplaceThisContentToRequest"
}

async function RequestApi(url, options) {
  console.log("[Request To Reqbin]", { url, options })
  const opt = {
    method: options?.method || "GET",
    url: encodeURI(url),
    apiNode: options?.apiNode || "US",
    contentType: options?.contentType || "",
    content: options?.content,
    headers: '',
    errors: '',
    curlCmd: '',
    codeCmd: '',
    jsonCmd: '',
    xmlCmd: '',
    lang: '',
    auth: {
      auth: 'noAuth',
      'bearer Token': '',
      basicUsername: '',
      basicPassword: '',
      customHeader: '',
      encrypted: ''
    },
    compare: false,
    idnUrl: encodeURI(url)
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