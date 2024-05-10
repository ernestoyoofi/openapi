const axios = require("axios")
const cheerio = require("cheerio")

const ListProvinsi = [
  "aceh", "bali", "bangkabelitung", "banten", "bengkulu",
  "diyogyakarta", "dkijakarta", "gorontalo", "jambi",
  "jawabarat", "jawatengah", "jawatimur",
  "kalimantanbarat", "kalimantanselatan", "kalimantantengah",
  "kalimantantimur", "kalimantanutara",
  "keplauanriau", "riau", "lampung", "maluku", "malukuutara",
  "nusantenggarabarat", "nusatenggaratimur",
  "papua", "papuabarat",
  "sulawesibarat", "sulawesitengah", "sulawesiselatan", "sulawesitenggara", "sulawesiutara",
  "sumaterabarat", "sumateraselatan", "sumaterautara"
]
const ListIdParams = [
  "hu", "t", "weather", "wd", "ws"
]
const ListCodeParams = {
  hu: "kelembabpan",
  t: "temperatur",
  weather: "cuaca",
  wd: "arah_angin",
  ws: "kecepatan_angin"
}
const ListCodeWeather = {
  "0": "Clear Skies | Cerah",
  "1": "Partly Cloudy | Cerah berawan",
  "2": "Partly Cloudy | Cerah berawan",
  "3": "Mostly Cloudy | Berawan",
  "4": "Overcast | Berawan Tebal",
  "5": "Haze | Udara Kabut",
  "10": "Smoke | Asap",
  "45": "Fog | Kabut",
  "60": "Light Rain | Hujan Ringan",
  "61": "Rain | Hujan Sedang",
  "63": "Heavy Rain | Hujan Lebat",
  "80": "Isolated Shower | Hujan Lokal",
  "95": "Severe Thunderstorm | Hujan Petir",
  "97": "Severe Thunderstorm | Hujan Petir",
}
const ListCodeWindDirection = {
  "N": "North | Utara",
  "NNE": "North Northeast | Utara Timur Laut",
  "NE": "Northeast | Timur Laut",
  "ENE": "East-northeast | Timur Laut",
  "E": "East | Timur",
  "ESE": "East-southeast | Timur Selatan",
  "SE": "Southeast | Selatan Laut",
  "SSE": "South-southeast | Selatan",
  "S": "South | Selatan",
  "SSW": "South-southwest | Barat Daya",
  "SW": "Southwest | Barat",
  "WSW": "West-southwest | Barat Daya",
  "W": "West | Barat",
  "WNW": "West-northwest | Barat Laut",
  "NW": "Northwest | Utara Barat",
  "NNW": "North-northwest | Utara Laut"
}

const timestamptodate = (timestamp) => {
  const setA = (a) => {
    return a < 10 ? `0${a}` : `${a}`
  }
  const setstg = `${timestamp.slice(0,4)} ${timestamp.slice(4,6)} ${timestamp.slice(6,8)} ${setA(Number(timestamp.slice(8,10)) + 1)}:${timestamp.slice(10,12)}:${timestamp.slice(12,14)}`
  return new Date(setstg)
}

async function APICuaca({ provinsi, areacode, onlyAreaReturn } = {}) {
  try {
    if(ListProvinsi.indexOf(provinsi) === -1) {
      return {
        status: 404,
        message: `Provinsi "${provinsi}" tidak dapat ditemukan pada list register`,
        docs: ""
      }
    }
    const fetchingdata = await axios.get(`https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-${provinsi.toLowerCase()}.xml`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Referer": "https://data.bmkg.go.id/prakiraan-cuaca/",
        "Sec-Ch-Ua-Platform": '"Windows"'
      }
    })
    const $ = cheerio.load(fetchingdata.data, { xmlMode: true })
    let areaData = []
    $("data area").each((i, el) => {
      areaData.push({
        name: $("name", el).eq(0).text().trim(),
        areaId: $(el).attr("id"),
        coordinate: $(el).attr("coordinate")
      })
    })
    if(onlyAreaReturn === true) {
      return {
        status: 200,
        data: {
          area: areaData
        }
      }
    }
    let dataWilayah = {}
    $("data area").each((i, el) => {
      let timeUpdate = {}
      $("parameter", el).each((a, b) => {
        const idparams = $(b).attr("id")
        if(ListIdParams.indexOf(idparams) === -1) return;
        $("timerange", b).each((c, d) => {
          const iddate = $(d).attr('datetime')
          if(!timeUpdate[iddate]) {
            timeUpdate[iddate] = {
              kelembabpan: "", temperatur: "", cuaca: "",
              kecepatan_angin: "", arah_angin: {},
              waktu: timestamptodate(iddate)
            }
          }
          if(idparams === "hu") {
            timeUpdate[iddate][ListCodeParams[idparams]] = $("value",d).eq(0).text()+"%"
            return;
          }
          if(idparams === "weather") {
            timeUpdate[iddate][ListCodeParams[idparams]] = ListCodeWeather[$("value",d).eq(0).text()]
            return;
          }
          if(idparams === "wd") {
            timeUpdate[iddate][ListCodeParams[idparams]] = {
              deg: Number($("value",d).eq(0).text()),
              title: ListCodeWindDirection[$("value",d).eq(1).text()] || "VAR"
            }
            return;
          }
          if(idparams === "ws") {
            timeUpdate[iddate][ListCodeParams[idparams]] = $("value",d).eq(1).text()+" KPM"
            return;
          }
          timeUpdate[iddate][ListCodeParams[idparams]] = "C."+$("value",d).eq(0).text()
        })
      })
      dataWilayah[$(el).attr("id")] = {
        title: $("name", el).eq(0).text().trim(),
        data: (Object.keys(timeUpdate).map((datetime => (timeUpdate[datetime])))),
      }
    })
    if(!isNaN(areacode) || typeof areaData === 'string') {
      const getAreaIndex = areaData.map(a => a.areaId).indexOf(areacode)
      if(getAreaIndex != -1) {
        return {
          status: 200,
          data: {
            report_source: $("data").attr("source"),
            report_time: timestamptodate($("timestamp", $("data issue").eq(0)).text().trim()),
            area: [
              areaData[getAreaIndex]
            ],
            area_report: {
              [`${areacode}`]: dataWilayah[areacode]
            }
          }
        }
      }
    }
    return {
      report_source: $("data").attr("source"),
      report_time: timestamptodate($("timestamp", $("data issue").eq(0)).text().trim()),
      area: areaData,
      area_report: dataWilayah
    }
  } catch(err) {
    console.log(err.stack)
    if(err.response) {
      return {
        badResponded: true
      }
    }
    return {
      internalError: true
    }
  }
}

module.exports = {
  ListCodeWindDirection,
  ListCodeWeather,
  ListCodeParams,
  ListIdParams,
  ListProvinsi,
  APICuaca
}