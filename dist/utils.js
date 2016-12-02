'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _;

  function param(object) {
    return _.map(object, function (value, key) {
      return '&' + window.encodeURIComponent(key) + '=' + window.encodeURIComponent(value);
    }).join('');
  }

  /**
   * Parse querystring args into a key:value map
   * @param query
   * @returns {Object} a map of key:value
   */

  _export('param', param);

  function parseQueryString(query) {
    // trim the leading # or ?
    if (query.indexOf("#") === 0 || query.indexOf("?") === 0) {
      query = query.substr(1);
    }
    var result = {};
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
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

  _export('parseQueryString', parseQueryString);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=utils.js.map
