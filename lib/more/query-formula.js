function fixBracketsSyntax(data) {
  let openBraces = 0
  let closeBraces = 0
  let openBrackets = 0
  let closeBrackets = 0

  for (const char of data) {
    if (char === '{') openBraces++
    if (char === '}') closeBraces++
    if (char === '[') openBrackets++
    if (char === ']') closeBrackets++
  }
  while (openBraces > closeBraces) {
    data += '}'
    closeBraces++
  }
  while (openBrackets > closeBrackets) {
    data += ']'
    closeBrackets++
  }
  return data
}

function parseRequestData(bodydata) {
  const regex = /type\s+\w+\s*{[^}]+}/g
  const request = bodydata.match(regex)
  let parseRequest = {}
  if(request) {
    request.forEach((reqdata) => {
      const [_, typeName, body] = reqdata.match(/type\s+(\w+)\s*{([^}]+)}/)
      try {
        const cleanedBody = fixBracketsSyntax(body.trim().replace(/\s+/g, ' '))
        const requestJson = eval(`({${cleanedBody}})`)
        parseRequest[typeName] = requestJson
      } catch(e) {
        console.error('[ParseDataRequestGraph]:', e)
      }
    })
  }

  return parseRequest
}

module.exports = {
  parseRequestData
}