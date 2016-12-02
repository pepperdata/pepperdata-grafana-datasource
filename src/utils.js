import _ from 'lodash';

export function param(object) {
  return _.map(object, function(value, key) {
    return '&' + window.encodeURIComponent(key) + '=' + window.encodeURIComponent(value);
  }).join('');
}

/**
 * Parse querystring args into a key:value map
 * @param query
 * @returns {Object} a map of key:value
 */
export function parseQueryString(query) {
  // trim the leading # or ?
  if (query.indexOf("#") === 0 || query.indexOf("?") === 0) {
    query = query.substr(1);
  }
  const result = {};
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === 'debug' && _.isUndefined(pair[1])) {
      result.debug = 1;
    } else {
      result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
  }
  // remove the empty mapping if it exists (can get this if there is no querystring)
  delete result[""];
  return result;
}
