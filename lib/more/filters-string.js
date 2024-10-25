module.exports = (stg) => {
  const Past = String(stg)
  return Past?.replace(/\n/g, "")?.trim()?.replace(/</g,"")
}