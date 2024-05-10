const { RequestApi } = require("./request/httpdebugger")
const axios = require("axios")
const cheerio = require("cheerio")

const baseURL = "https://ssstik.io/abc"
// const tiktokToken = "blpLek5i"

async function GetInfoDownload({ url }) {
  if(!url) {
    return {
      notValid: true
    }
  }
  const scrapId = await axios.get(new URL(baseURL).origin)
  const scrapHt = cheerio.load(scrapId.data)
  let tiktokToken = scrapHt("script").eq(1).text().split("s_tt = '")[1].split("',")[0].trim()
  const data = await axios.post(baseURL+"?url=dl", new URLSearchParams({
    id: url,
    locale: "id",
    tt: tiktokToken
  }).toString(), {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    }
  })
  if(data.status != 200) {
    return {
      notAccpted: true
    }
  }
  const $ = cheerio.load(data.data)
  console.log(scrapId, tiktokToken, $("html").html())
  const imagePost = $("ul.splide__list")
  let hdUrl = ""
  let urlXPost = ""
  let imageMedia = []
  if(imagePost.length === 0) {
    urlXPost = $("#dl_btns > a.pure-button.pure-button-primary.is-center.u-bl.dl-button.download_link.without_watermark_hd.vignette_active.notranslate").attr("hx-post")||""
    // const reqRedirect = await RequestApi(new URL(urlXPost, baseURL).href, {
    //   method: "POST",
    //   contentType: "URLENCODED",
    //   content: new URLSearchParams({
    //     tt: tiktokToken
    //   }).toString()
    // })
    // console.log(reqRedirect.headers, reqRedirect.data)
  } else {
    $("li a.download_link.slide.notranslate").each((i, el) => {
      console.log($(el))
      imageMedia.push($(el).attr("href"))
    })
  }
  const videoObj = {
    type: "video",
    caption: $("#avatarAndTextUsual > div.pure-u-18-24.pd-lr > p").text().trim(),
    media: $("#dl_btns > a.pure-button.pure-button-primary.is-center.u-bl.dl-button.download_link.without_watermark.vignette_active.notranslate")?.eq(0)?.attr("href"),
    media_hd: hdUrl,
    rd_hdvideo: urlXPost.split("url=")[1]||"",
    audio: $("#dl_btns > a.pure-button.pure-button-primary.is-center.u-bl.dl-button.download_link.music.vignette_active.notranslate")?.attr("href")
  }
  const imageObj = {
    type: "image",
    caption: "",
    media: imageMedia,
    audio: $("#mainpicture > div > div:nth-child(2) > div.result_overlay_buttons > a.pure-button.pure-button-primary.is-center.u-bl.dl-button.download_link.music.notranslate").attr("href")
  }
  return imagePost.length === 0? videoObj : imageObj
}
// GetInfoDownload({
//   url: "https://www.tiktok.com/@nakiko.chan_/photo/7342317087685119237"
// }).then(console.log)
// GetInfoDownload({
//   url: "https://www.tiktok.com/@sanzkuyzz/video/7355486353938844933"
// }).then(console.log)

module.exports = {
  GetInfoDownload
}