function cookieParser(cookieString) {
  const cookies = cookieString.split(',');
  const cookieArray = cookies.map(cookie => {
      const [key, value] = cookie.split(';')[0].split('=');
      if(!value || value == "undefined") {
        return "-"
      }
      return `${key}=${value}`;
  });
  return cookieArray.filter(a => a.length > 1)
}

module.exports = cookieParser