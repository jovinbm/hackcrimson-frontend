/**
 *
 * @param {string} key - e.g. page
 * @param {string|number} value - e.g. 1
 * @param {string} url - e.g. ?page=1&a=b or full like http://localhost:3000?ksjdn=sdkjf
 * @returns {string}
 */
export function updateQueryString(key, value, url) {
  if (typeof url !== 'string') {
    url = window.location.href
  }
  const re = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi')
  let hash
  
  if (re.test(url)) {
    if (typeof value !== 'undefined' && value !== null) {
      return url.replace(re, `$1${key}=${value}$2$3`)
    } else {
      hash = url.split('#')
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '')
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
        url += `#${hash[1]}`
      }
      
      return url
    }
  } else if (typeof value !== 'undefined' && value !== null) {
    const separator = url.indexOf('?') !== -1 ? '&' : '?'
    
    hash = url.split('#')
    url = `${hash[0]}${separator}${key}=${value}`
    if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
      url += `#${hash[1]}`
    }
    
    return url
  } else {
    return url
  }
}

export function updateSearchQueries(obj) {
  const searchParams = new URLSearchParams(window.location.search)
  Object.keys(obj).map(key => {
    const value = obj[key]
    searchParams.set(key, value)
    return true
  })
  if (window.history.replaceState) {
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${searchParams.toString()}`
    window.history.replaceState({path: newUrl}, '', newUrl)
  }
  return searchParams
}