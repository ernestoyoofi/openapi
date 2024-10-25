function GetNextPage(num) {
  const NumPages = Math.floor(isNaN(num)? 0 : Number(String(num).replace(/[^0-9]+/g, "")))
  return NumPages < 0? 0 : NumPages + 1
}

function GetNextPagePath(num) {
  const __Numpage = GetNextPage(num)
  if(__Numpage > 1) {
    return `page/${__Numpage}/`
  }
  return ''
}

module.exports = {
  GetNextPage,
  GetNextPagePath
}