'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var http = require('http');
var https = require('https');
var url = require('url');
var stream = require('stream');
var assert = require('assert');
var debug$1 = require('debug');
var zlib = require('zlib');
var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var url__default = /*#__PURE__*/_interopDefaultLegacy(url);
var stream__default = /*#__PURE__*/_interopDefaultLegacy(stream);
var assert__default = /*#__PURE__*/_interopDefaultLegacy(assert);
var debug__default = /*#__PURE__*/_interopDefaultLegacy(debug$1);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);
var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
var transformData = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

var cookies = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
var buildFullPath = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

var isURLSameOrigin = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

var debug;

var debug_1 = function () {
  if (!debug) {
    try {
      /* eslint global-require: off */
      debug = debug__default['default']("follow-redirects");
    }
    catch (error) {
      debug = function () { /* */ };
    }
  }
  debug.apply(null, arguments);
};

var URL = url__default['default'].URL;


var Writable = stream__default['default'].Writable;



// Create handlers that pass events from native requests
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = Object.create(null);
events.forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  ""
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  abortRequest(this._currentRequest);
  this.emit("abort");
};

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  var self = this;
  if (callback) {
    this.on("timeout", callback);
  }

  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }

  // Sets up a timer to trigger a timeout event
  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(function () {
      self.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  // Prevent a timeout from triggering
  function clearTimer() {
    clearTimeout(this._timeout);
    if (callback) {
      self.removeListener("timeout", callback);
    }
    if (!this.socket) {
      self._currentRequest.removeListener("socket", startTimer);
    }
  }

  // Start the timer when the socket is opened
  if (this.socket) {
    startTimer(this.socket);
  }
  else {
    this._currentRequest.once("socket", startTimer);
  }

  this.on("socket", destroyOnTimeout);
  this.once("response", clearTimer);
  this.once("error", clearTimer);

  return this;
};

// Proxy all other public ClientRequest methods
[
  "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url__default['default'].format(this._options);

  // Set up event handlers
  request._redirectable = this;
  for (var e = 0; e < events.length; e++) {
    request.on(events[e], eventHandlers[events[e]]);
  }

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.
  var location = response.headers.location;
  if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
    // Abort the current request
    abortRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
      url__default['default'].parse(this._currentUrl).hostname;

    // Create the redirected request
    var redirectUrl = url__default['default'].resolve(this._currentUrl, location);
    debug_1("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url__default['default'].parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop the Authorization header if redirecting to another host
    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      var error = new RedirectionError("Redirected request failed: " + cause.message);
      error.cause = cause;
      this.emit("error", error);
    }
  }
  else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url__default['default'].parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert__default['default'].equal(options.protocol, protocol, "protocol mismatch");
      debug_1("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

function abortRequest(request) {
  for (var e = 0; e < events.length; e++) {
    request.removeListener(events[e], eventHandlers[events[e]]);
  }
  request.on("error", noop);
  request.abort();
}

// Exports
var followRedirects = wrap({ http: http__default['default'], https: https__default['default'] });
var wrap_1 = wrap;
followRedirects.wrap = wrap_1;

var name = "axios";
var version = "0.21.1";
var description = "Promise based HTTP client for the browser and node.js";
var main = "index.js";
var scripts = {
	test: "grunt test && bundlesize",
	start: "node ./sandbox/server.js",
	build: "NODE_ENV=production grunt build",
	preversion: "npm test",
	version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json",
	postversion: "git push && git push --tags",
	examples: "node ./examples/server.js",
	coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
	fix: "eslint --fix lib/**/*.js"
};
var repository = {
	type: "git",
	url: "https://github.com/axios/axios.git"
};
var keywords = [
	"xhr",
	"http",
	"ajax",
	"promise",
	"node"
];
var author = "Matt Zabriskie";
var license = "MIT";
var bugs = {
	url: "https://github.com/axios/axios/issues"
};
var homepage = "https://github.com/axios/axios";
var devDependencies = {
	bundlesize: "^0.17.0",
	coveralls: "^3.0.0",
	"es6-promise": "^4.2.4",
	grunt: "^1.0.2",
	"grunt-banner": "^0.6.0",
	"grunt-cli": "^1.2.0",
	"grunt-contrib-clean": "^1.1.0",
	"grunt-contrib-watch": "^1.0.0",
	"grunt-eslint": "^20.1.0",
	"grunt-karma": "^2.0.0",
	"grunt-mocha-test": "^0.13.3",
	"grunt-ts": "^6.0.0-beta.19",
	"grunt-webpack": "^1.0.18",
	"istanbul-instrumenter-loader": "^1.0.0",
	"jasmine-core": "^2.4.1",
	karma: "^1.3.0",
	"karma-chrome-launcher": "^2.2.0",
	"karma-coverage": "^1.1.1",
	"karma-firefox-launcher": "^1.1.0",
	"karma-jasmine": "^1.1.1",
	"karma-jasmine-ajax": "^0.1.13",
	"karma-opera-launcher": "^1.0.0",
	"karma-safari-launcher": "^1.0.0",
	"karma-sauce-launcher": "^1.2.0",
	"karma-sinon": "^1.0.5",
	"karma-sourcemap-loader": "^0.3.7",
	"karma-webpack": "^1.7.0",
	"load-grunt-tasks": "^3.5.2",
	minimist: "^1.2.0",
	mocha: "^5.2.0",
	sinon: "^4.5.0",
	typescript: "^2.8.1",
	"url-search-params": "^0.10.0",
	webpack: "^1.13.1",
	"webpack-dev-server": "^1.14.1"
};
var browser = {
	"./lib/adapters/http.js": "./lib/adapters/xhr.js"
};
var jsdelivr = "dist/axios.min.js";
var unpkg = "dist/axios.min.js";
var typings = "./index.d.ts";
var dependencies = {
	"follow-redirects": "^1.10.0"
};
var bundlesize = [
	{
		path: "./dist/axios.min.js",
		threshold: "5kB"
	}
];
var _package = {
	name: name,
	version: version,
	description: description,
	main: main,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	devDependencies: devDependencies,
	browser: browser,
	jsdelivr: jsdelivr,
	unpkg: unpkg,
	typings: typings,
	dependencies: dependencies,
	bundlesize: bundlesize
};

var _package$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  name: name,
  version: version,
  description: description,
  main: main,
  scripts: scripts,
  repository: repository,
  keywords: keywords,
  author: author,
  license: license,
  bugs: bugs,
  homepage: homepage,
  devDependencies: devDependencies,
  browser: browser,
  jsdelivr: jsdelivr,
  unpkg: unpkg,
  typings: typings,
  dependencies: dependencies,
  bundlesize: bundlesize,
  'default': _package
});

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var pkg = getCjsExportFromNamespace(_package$1);

var httpFollow = followRedirects.http;
var httpsFollow = followRedirects.https;






var isHttps = /https:?/;

/**
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} proxy
 * @param {string} location
 */
function setProxy(options, proxy, location) {
  options.hostname = proxy.host;
  options.host = proxy.host;
  options.port = proxy.port;
  options.path = location;

  // Basic proxy authorization
  if (proxy.auth) {
    var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
  }

  // If a proxy is used, any redirects must also pass through the proxy
  options.beforeRedirect = function beforeRedirect(redirection) {
    redirection.headers.host = redirection.host;
    setProxy(redirection, proxy, redirection.href);
  };
}

/*eslint consistent-return:0*/
var http_1 = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) ; else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url__default['default'].parse(fullPath);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url__default['default'].parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }

        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port,
            protocol: parsedProxyUrl.protocol
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https__default['default'] : http__default['default'];
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib__default['default'].createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = http_1;
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults_1 = defaults;

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults_1.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
var mergeConfig = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

var Axios_1 = Axios;

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

var Cancel_1 = Cancel;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
var isAxiosError = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios_1.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios$1 = createInstance(defaults_1);

// Expose Axios class to allow class inheritance
axios$1.Axios = Axios_1;

// Factory for creating new instances
axios$1.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios$1.Cancel = Cancel_1;
axios$1.CancelToken = CancelToken_1;
axios$1.isCancel = isCancel;

// Expose all/spread
axios$1.all = function all(promises) {
  return Promise.all(promises);
};
axios$1.spread = spread;

// Expose isAxiosError
axios$1.isAxiosError = isAxiosError;

var axios_1 = axios$1;

// Allow use of default import syntax in TypeScript
var default_1 = axios$1;
axios_1.default = default_1;

var axios = axios_1;

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto__default['default'].randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

// NOTE: this list must be up-to-date with browsers listed in
// test/acceptance/useragentstrings.yml
const BROWSER_ALIASES_MAP = {
  'Amazon Silk': 'amazon_silk',
  'Android Browser': 'android',
  Bada: 'bada',
  BlackBerry: 'blackberry',
  Chrome: 'chrome',
  Chromium: 'chromium',
  Electron: 'electron',
  Epiphany: 'epiphany',
  Firefox: 'firefox',
  Focus: 'focus',
  Generic: 'generic',
  'Google Search': 'google_search',
  Googlebot: 'googlebot',
  'Internet Explorer': 'ie',
  'K-Meleon': 'k_meleon',
  Maxthon: 'maxthon',
  'Microsoft Edge': 'edge',
  'MZ Browser': 'mz',
  'NAVER Whale Browser': 'naver',
  Opera: 'opera',
  'Opera Coast': 'opera_coast',
  PhantomJS: 'phantomjs',
  Puffin: 'puffin',
  QupZilla: 'qupzilla',
  QQ: 'qq',
  QQLite: 'qqlite',
  Safari: 'safari',
  Sailfish: 'sailfish',
  'Samsung Internet for Android': 'samsung_internet',
  SeaMonkey: 'seamonkey',
  Sleipnir: 'sleipnir',
  Swing: 'swing',
  Tizen: 'tizen',
  'UC Browser': 'uc',
  Vivaldi: 'vivaldi',
  'WebOS Browser': 'webos',
  WeChat: 'wechat',
  'Yandex Browser': 'yandex',
  Roku: 'roku',
};

const BROWSER_MAP = {
  amazon_silk: 'Amazon Silk',
  android: 'Android Browser',
  bada: 'Bada',
  blackberry: 'BlackBerry',
  chrome: 'Chrome',
  chromium: 'Chromium',
  electron: 'Electron',
  epiphany: 'Epiphany',
  firefox: 'Firefox',
  focus: 'Focus',
  generic: 'Generic',
  googlebot: 'Googlebot',
  google_search: 'Google Search',
  ie: 'Internet Explorer',
  k_meleon: 'K-Meleon',
  maxthon: 'Maxthon',
  edge: 'Microsoft Edge',
  mz: 'MZ Browser',
  naver: 'NAVER Whale Browser',
  opera: 'Opera',
  opera_coast: 'Opera Coast',
  phantomjs: 'PhantomJS',
  puffin: 'Puffin',
  qupzilla: 'QupZilla',
  qq: 'QQ Browser',
  qqlite: 'QQ Browser Lite',
  safari: 'Safari',
  sailfish: 'Sailfish',
  samsung_internet: 'Samsung Internet for Android',
  seamonkey: 'SeaMonkey',
  sleipnir: 'Sleipnir',
  swing: 'Swing',
  tizen: 'Tizen',
  uc: 'UC Browser',
  vivaldi: 'Vivaldi',
  webos: 'WebOS Browser',
  wechat: 'WeChat',
  yandex: 'Yandex Browser',
};

const PLATFORMS_MAP = {
  tablet: 'tablet',
  mobile: 'mobile',
  desktop: 'desktop',
  tv: 'tv',
};

const OS_MAP = {
  WindowsPhone: 'Windows Phone',
  Windows: 'Windows',
  MacOS: 'macOS',
  iOS: 'iOS',
  Android: 'Android',
  WebOS: 'WebOS',
  BlackBerry: 'BlackBerry',
  Bada: 'Bada',
  Tizen: 'Tizen',
  Linux: 'Linux',
  ChromeOS: 'Chrome OS',
  PlayStation4: 'PlayStation 4',
  Roku: 'Roku',
};

const ENGINE_MAP = {
  EdgeHTML: 'EdgeHTML',
  Blink: 'Blink',
  Trident: 'Trident',
  Presto: 'Presto',
  Gecko: 'Gecko',
  WebKit: 'WebKit',
};

class Utils {
  /**
   * Get first matched item for a string
   * @param {RegExp} regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getFirstMatch(regexp, ua) {
    const match = ua.match(regexp);
    return (match && match.length > 0 && match[1]) || '';
  }

  /**
   * Get second matched item for a string
   * @param regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getSecondMatch(regexp, ua) {
    const match = ua.match(regexp);
    return (match && match.length > 1 && match[2]) || '';
  }

  /**
   * Match a regexp and return a constant or undefined
   * @param {RegExp} regexp
   * @param {String} ua
   * @param {*} _const Any const that will be returned if regexp matches the string
   * @return {*}
   */
  static matchAndReturnConst(regexp, ua, _const) {
    if (regexp.test(ua)) {
      return _const;
    }
    return void (0);
  }

  static getWindowsVersionName(version) {
    switch (version) {
      case 'NT': return 'NT';
      case 'XP': return 'XP';
      case 'NT 5.0': return '2000';
      case 'NT 5.1': return 'XP';
      case 'NT 5.2': return '2003';
      case 'NT 6.0': return 'Vista';
      case 'NT 6.1': return '7';
      case 'NT 6.2': return '8';
      case 'NT 6.3': return '8.1';
      case 'NT 10.0': return '10';
      default: return undefined;
    }
  }

  /**
   * Get macOS version name
   *    10.5 - Leopard
   *    10.6 - Snow Leopard
   *    10.7 - Lion
   *    10.8 - Mountain Lion
   *    10.9 - Mavericks
   *    10.10 - Yosemite
   *    10.11 - El Capitan
   *    10.12 - Sierra
   *    10.13 - High Sierra
   *    10.14 - Mojave
   *    10.15 - Catalina
   *
   * @example
   *   getMacOSVersionName("10.14") // 'Mojave'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getMacOSVersionName(version) {
    const v = version.split('.').splice(0, 2).map(s => parseInt(s, 10) || 0);
    v.push(0);
    if (v[0] !== 10) return undefined;
    switch (v[1]) {
      case 5: return 'Leopard';
      case 6: return 'Snow Leopard';
      case 7: return 'Lion';
      case 8: return 'Mountain Lion';
      case 9: return 'Mavericks';
      case 10: return 'Yosemite';
      case 11: return 'El Capitan';
      case 12: return 'Sierra';
      case 13: return 'High Sierra';
      case 14: return 'Mojave';
      case 15: return 'Catalina';
      default: return undefined;
    }
  }

  /**
   * Get Android version name
   *    1.5 - Cupcake
   *    1.6 - Donut
   *    2.0 - Eclair
   *    2.1 - Eclair
   *    2.2 - Froyo
   *    2.x - Gingerbread
   *    3.x - Honeycomb
   *    4.0 - Ice Cream Sandwich
   *    4.1 - Jelly Bean
   *    4.4 - KitKat
   *    5.x - Lollipop
   *    6.x - Marshmallow
   *    7.x - Nougat
   *    8.x - Oreo
   *    9.x - Pie
   *
   * @example
   *   getAndroidVersionName("7.0") // 'Nougat'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getAndroidVersionName(version) {
    const v = version.split('.').splice(0, 2).map(s => parseInt(s, 10) || 0);
    v.push(0);
    if (v[0] === 1 && v[1] < 5) return undefined;
    if (v[0] === 1 && v[1] < 6) return 'Cupcake';
    if (v[0] === 1 && v[1] >= 6) return 'Donut';
    if (v[0] === 2 && v[1] < 2) return 'Eclair';
    if (v[0] === 2 && v[1] === 2) return 'Froyo';
    if (v[0] === 2 && v[1] > 2) return 'Gingerbread';
    if (v[0] === 3) return 'Honeycomb';
    if (v[0] === 4 && v[1] < 1) return 'Ice Cream Sandwich';
    if (v[0] === 4 && v[1] < 4) return 'Jelly Bean';
    if (v[0] === 4 && v[1] >= 4) return 'KitKat';
    if (v[0] === 5) return 'Lollipop';
    if (v[0] === 6) return 'Marshmallow';
    if (v[0] === 7) return 'Nougat';
    if (v[0] === 8) return 'Oreo';
    if (v[0] === 9) return 'Pie';
    return undefined;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  static getVersionPrecision(version) {
    return version.split('.').length;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
   *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
   *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
   *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
   *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
   *
   * @param {String} versionA versions versions to compare
   * @param {String} versionB versions versions to compare
   * @param {boolean} [isLoose] enable loose comparison
   * @return {Number} comparison result: -1 when versionA is lower,
   * 1 when versionA is bigger, 0 when both equal
   */
  /* eslint consistent-return: 1 */
  static compareVersions(versionA, versionB, isLoose = false) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    const versionAPrecision = Utils.getVersionPrecision(versionA);
    const versionBPrecision = Utils.getVersionPrecision(versionB);

    let precision = Math.max(versionAPrecision, versionBPrecision);
    let lastPrecision = 0;

    const chunks = Utils.map([versionA, versionB], (version) => {
      const delta = precision - Utils.getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      const _version = version + new Array(delta + 1).join('.0');

      // 3) "9.0" -> ["000000000"", "000000009"]
      return Utils.map(_version.split('.'), chunk => new Array(20 - chunk.length).join('0') + chunk).reverse();
    });

    // adjust precision for loose comparison
    if (isLoose) {
      lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
    }

    // iterate in reverse order by reversed chunks array
    precision -= 1;
    while (precision >= lastPrecision) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }

      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) {
          // all version chunks are same
          return 0;
        }

        precision -= 1;
      } else if (chunks[0][precision] < chunks[1][precision]) {
        return -1;
      }
    }

    return undefined;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  static map(arr, iterator) {
    const result = [];
    let i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i += 1) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Array::find polyfill
   *
   * @param  {Array} arr
   * @param  {Function} predicate
   * @return {Array}
   */
  static find(arr, predicate) {
    let i;
    let l;
    if (Array.prototype.find) {
      return Array.prototype.find.call(arr, predicate);
    }
    for (i = 0, l = arr.length; i < l; i += 1) {
      const value = arr[i];
      if (predicate(value, i)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Object::assign polyfill
   *
   * @param  {Object} obj
   * @param  {Object} ...objs
   * @return {Object}
   */
  static assign(obj, ...assigners) {
    const result = obj;
    let i;
    let l;
    if (Object.assign) {
      return Object.assign(obj, ...assigners);
    }
    for (i = 0, l = assigners.length; i < l; i += 1) {
      const assigner = assigners[i];
      if (typeof assigner === 'object' && assigner !== null) {
        const keys = Object.keys(assigner);
        keys.forEach((key) => {
          result[key] = assigner[key];
        });
      }
    }
    return obj;
  }

  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('Microsoft Edge') // edge
   *
   * @param  {string} browserName
   * @return {string}
   */
  static getBrowserAlias(browserName) {
    return BROWSER_ALIASES_MAP[browserName];
  }

  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('edge') // Microsoft Edge
   *
   * @param  {string} browserAlias
   * @return {string}
   */
  static getBrowserTypeByAlias(browserAlias) {
    return BROWSER_MAP[browserAlias] || '';
  }
}

/**
 * Browsers' descriptors
 *
 * The idea of descriptors is simple. You should know about them two simple things:
 * 1. Every descriptor has a method or property called `test` and a `describe` method.
 * 2. Order of descriptors is important.
 *
 * More details:
 * 1. Method or property `test` serves as a way to detect whether the UA string
 * matches some certain browser or not. The `describe` method helps to make a result
 * object with params that show some browser-specific things: name, version, etc.
 * 2. Order of descriptors is important because a Parser goes through them one by one
 * in course. For example, if you insert Chrome's descriptor as the first one,
 * more then a half of browsers will be described as Chrome, because they will pass
 * the Chrome descriptor's test.
 *
 * Descriptor's `test` could be a property with an array of RegExps, where every RegExp
 * will be applied to a UA string to test it whether it matches or not.
 * If a descriptor has two or more regexps in the `test` array it tests them one by one
 * with a logical sum operation. Parser stops if it has found any RegExp that matches the UA.
 *
 * Or `test` could be a method. In that case it gets a Parser instance and should
 * return true/false to get the Parser know if this browser descriptor matches the UA or not.
 */

const commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;

const browsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe(ua) {
      const browser = {
        name: 'Googlebot',
      };
      const version = Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* Opera < 13.0 */
  {
    test: [/opera/i],
    describe(ua) {
      const browser = {
        name: 'Opera',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* Opera > 13.0 */
  {
    test: [/opr\/|opios/i],
    describe(ua) {
      const browser = {
        name: 'Opera',
      };
      const version = Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/SamsungBrowser/i],
    describe(ua) {
      const browser = {
        name: 'Samsung Internet for Android',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/Whale/i],
    describe(ua) {
      const browser = {
        name: 'NAVER Whale Browser',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/MZBrowser/i],
    describe(ua) {
      const browser = {
        name: 'MZ Browser',
      };
      const version = Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/focus/i],
    describe(ua) {
      const browser = {
        name: 'Focus',
      };
      const version = Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/swing/i],
    describe(ua) {
      const browser = {
        name: 'Swing',
      };
      const version = Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/coast/i],
    describe(ua) {
      const browser = {
        name: 'Opera Coast',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/opt\/\d+(?:.?_?\d+)+/i],
    describe(ua) {
      const browser = {
        name: 'Opera Touch',
      };
      const version = Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/yabrowser/i],
    describe(ua) {
      const browser = {
        name: 'Yandex Browser',
      };
      const version = Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/ucbrowser/i],
    describe(ua) {
      const browser = {
        name: 'UC Browser',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/Maxthon|mxios/i],
    describe(ua) {
      const browser = {
        name: 'Maxthon',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/epiphany/i],
    describe(ua) {
      const browser = {
        name: 'Epiphany',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/puffin/i],
    describe(ua) {
      const browser = {
        name: 'Puffin',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/sleipnir/i],
    describe(ua) {
      const browser = {
        name: 'Sleipnir',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/k-meleon/i],
    describe(ua) {
      const browser = {
        name: 'K-Meleon',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/micromessenger/i],
    describe(ua) {
      const browser = {
        name: 'WeChat',
      };
      const version = Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/qqbrowser/i],
    describe(ua) {
      const browser = {
        name: (/qqbrowserlite/i).test(ua) ? 'QQ Browser Lite' : 'QQ Browser',
      };
      const version = Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/msie|trident/i],
    describe(ua) {
      const browser = {
        name: 'Internet Explorer',
      };
      const version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/\sedg\//i],
    describe(ua) {
      const browser = {
        name: 'Microsoft Edge',
      };

      const version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/edg([ea]|ios)/i],
    describe(ua) {
      const browser = {
        name: 'Microsoft Edge',
      };

      const version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/vivaldi/i],
    describe(ua) {
      const browser = {
        name: 'Vivaldi',
      };
      const version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/seamonkey/i],
    describe(ua) {
      const browser = {
        name: 'SeaMonkey',
      };
      const version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/sailfish/i],
    describe(ua) {
      const browser = {
        name: 'Sailfish',
      };

      const version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/silk/i],
    describe(ua) {
      const browser = {
        name: 'Amazon Silk',
      };
      const version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/phantom/i],
    describe(ua) {
      const browser = {
        name: 'PhantomJS',
      };
      const version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/slimerjs/i],
    describe(ua) {
      const browser = {
        name: 'SlimerJS',
      };
      const version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const browser = {
        name: 'BlackBerry',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const browser = {
        name: 'WebOS Browser',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/bada/i],
    describe(ua) {
      const browser = {
        name: 'Bada',
      };
      const version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/tizen/i],
    describe(ua) {
      const browser = {
        name: 'Tizen',
      };
      const version = Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/qupzilla/i],
    describe(ua) {
      const browser = {
        name: 'QupZilla',
      };
      const version = Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/firefox|iceweasel|fxios/i],
    describe(ua) {
      const browser = {
        name: 'Firefox',
      };
      const version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/electron/i],
    describe(ua) {
      const browser = {
        name: 'Electron',
      };
      const version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/MiuiBrowser/i],
    describe(ua) {
      const browser = {
        name: 'Miui',
      };
      const version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/chromium/i],
    describe(ua) {
      const browser = {
        name: 'Chromium',
      };
      const version = Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/chrome|crios|crmo/i],
    describe(ua) {
      const browser = {
        name: 'Chrome',
      };
      const version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },
  {
    test: [/GSA/i],
    describe(ua) {
      const browser = {
        name: 'Google Search',
      };
      const version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* Android Browser */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const browser = {
        name: 'Android Browser',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* PlayStation 4 */
  {
    test: [/playstation 4/i],
    describe(ua) {
      const browser = {
        name: 'PlayStation 4',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* Safari */
  {
    test: [/safari|applewebkit/i],
    describe(ua) {
      const browser = {
        name: 'Safari',
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    },
  },

  /* Something else */
  {
    test: [/.*/i],
    describe(ua) {
      /* Here we try to make sure that there are explicit details about the device
       * in order to decide what regexp exactly we want to apply
       * (as there is a specific decision based on that conclusion)
       */
      const regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
      const regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
      const hasDeviceSpec = ua.search('\\(') !== -1;
      const regexp = hasDeviceSpec ? regexpWithDeviceSpec : regexpWithoutDeviceSpec;
      return {
        name: Utils.getFirstMatch(regexp, ua),
        version: Utils.getSecondMatch(regexp, ua),
      };
    },
  },
];

var osParsersList = [
  /* Roku */
  {
    test: [/Roku\/DVP/],
    describe(ua) {
      const version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua);
      return {
        name: OS_MAP.Roku,
        version,
      };
    },
  },

  /* Windows Phone */
  {
    test: [/windows phone/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.WindowsPhone,
        version,
      };
    },
  },

  /* Windows */
  {
    test: [/windows /i],
    describe(ua) {
      const version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua);
      const versionName = Utils.getWindowsVersionName(version);

      return {
        name: OS_MAP.Windows,
        version,
        versionName,
      };
    },
  },

  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe(ua) {
      const result = {
        name: OS_MAP.iOS,
      };
      const version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua);
      if (version) {
        result.version = version;
      }
      return result;
    },
  },

  /* macOS */
  {
    test: [/macintosh/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, '.');
      const versionName = Utils.getMacOSVersionName(version);

      const os = {
        name: OS_MAP.MacOS,
        version,
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    },
  },

  /* iOS */
  {
    test: [/(ipod|iphone|ipad)/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, '.');

      return {
        name: OS_MAP.iOS,
        version,
      };
    },
  },

  /* Android */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua);
      const versionName = Utils.getAndroidVersionName(version);
      const os = {
        name: OS_MAP.Android,
        version,
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    },
  },

  /* WebOS */
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua);
      const os = {
        name: OS_MAP.WebOS,
      };

      if (version && version.length) {
        os.version = version;
      }
      return os;
    },
  },

  /* BlackBerry */
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua)
        || Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua)
        || Utils.getFirstMatch(/\bbb(\d+)/i, ua);

      return {
        name: OS_MAP.BlackBerry,
        version,
      };
    },
  },

  /* Bada */
  {
    test: [/bada/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua);

      return {
        name: OS_MAP.Bada,
        version,
      };
    },
  },

  /* Tizen */
  {
    test: [/tizen/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua);

      return {
        name: OS_MAP.Tizen,
        version,
      };
    },
  },

  /* Linux */
  {
    test: [/linux/i],
    describe() {
      return {
        name: OS_MAP.Linux,
      };
    },
  },

  /* Chrome OS */
  {
    test: [/CrOS/],
    describe() {
      return {
        name: OS_MAP.ChromeOS,
      };
    },
  },

  /* Playstation 4 */
  {
    test: [/PlayStation 4/],
    describe(ua) {
      const version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.PlayStation4,
        version,
      };
    },
  },
];

/*
 * Tablets go first since usually they have more specific
 * signs to detect.
 */

var platformParsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe() {
      return {
        type: 'bot',
        vendor: 'Google',
      };
    },
  },

  /* Huawei */
  {
    test: [/huawei/i],
    describe(ua) {
      const model = Utils.getFirstMatch(/(can-l01)/i, ua) && 'Nova';
      const platform = {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Huawei',
      };
      if (model) {
        platform.model = model;
      }
      return platform;
    },
  },

  /* Nexus Tablet */
  {
    test: [/nexus\s*(?:7|8|9|10).*/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Nexus',
      };
    },
  },

  /* iPad */
  {
    test: [/ipad/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Apple',
        model: 'iPad',
      };
    },
  },

  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Apple',
        model: 'iPad',
      };
    },
  },

  /* Amazon Kindle Fire */
  {
    test: [/kftt build/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Amazon',
        model: 'Kindle Fire HD 7',
      };
    },
  },

  /* Another Amazon Tablet with Silk */
  {
    test: [/silk/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Amazon',
      };
    },
  },

  /* Tablet */
  {
    test: [/tablet(?! pc)/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
      };
    },
  },

  /* iPod/iPhone */
  {
    test(parser) {
      const iDevice = parser.test(/ipod|iphone/i);
      const likeIDevice = parser.test(/like (ipod|iphone)/i);
      return iDevice && !likeIDevice;
    },
    describe(ua) {
      const model = Utils.getFirstMatch(/(ipod|iphone)/i, ua);
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Apple',
        model,
      };
    },
  },

  /* Nexus Mobile */
  {
    test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Nexus',
      };
    },
  },

  /* Mobile */
  {
    test: [/[^-]mobi/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
      };
    },
  },

  /* BlackBerry */
  {
    test(parser) {
      return parser.getBrowserName(true) === 'blackberry';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'BlackBerry',
      };
    },
  },

  /* Bada */
  {
    test(parser) {
      return parser.getBrowserName(true) === 'bada';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
      };
    },
  },

  /* Windows Phone */
  {
    test(parser) {
      return parser.getBrowserName() === 'windows phone';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Microsoft',
      };
    },
  },

  /* Android Tablet */
  {
    test(parser) {
      const osMajorVersion = Number(String(parser.getOSVersion()).split('.')[0]);
      return parser.getOSName(true) === 'android' && (osMajorVersion >= 3);
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
      };
    },
  },

  /* Android Mobile */
  {
    test(parser) {
      return parser.getOSName(true) === 'android';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
      };
    },
  },

  /* desktop */
  {
    test(parser) {
      return parser.getOSName(true) === 'macos';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop,
        vendor: 'Apple',
      };
    },
  },

  /* Windows */
  {
    test(parser) {
      return parser.getOSName(true) === 'windows';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop,
      };
    },
  },

  /* Linux */
  {
    test(parser) {
      return parser.getOSName(true) === 'linux';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop,
      };
    },
  },

  /* PlayStation 4 */
  {
    test(parser) {
      return parser.getOSName(true) === 'playstation 4';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv,
      };
    },
  },

  /* Roku */
  {
    test(parser) {
      return parser.getOSName(true) === 'roku';
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv,
      };
    },
  },
];

/*
 * More specific goes first
 */
var enginesParsersList = [
  /* EdgeHTML */
  {
    test(parser) {
      return parser.getBrowserName(true) === 'microsoft edge';
    },
    describe(ua) {
      const isBlinkBased = /\sedg\//i.test(ua);

      // return blink if it's blink-based one
      if (isBlinkBased) {
        return {
          name: ENGINE_MAP.Blink,
        };
      }

      // otherwise match the version and return EdgeHTML
      const version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua);

      return {
        name: ENGINE_MAP.EdgeHTML,
        version,
      };
    },
  },

  /* Trident */
  {
    test: [/trident/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Trident,
      };

      const version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    },
  },

  /* Presto */
  {
    test(parser) {
      return parser.test(/presto/i);
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Presto,
      };

      const version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    },
  },

  /* Gecko */
  {
    test(parser) {
      const isGecko = parser.test(/gecko/i);
      const likeGecko = parser.test(/like gecko/i);
      return isGecko && !likeGecko;
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Gecko,
      };

      const version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    },
  },

  /* Blink */
  {
    test: [/(apple)?webkit\/537\.36/i],
    describe() {
      return {
        name: ENGINE_MAP.Blink,
      };
    },
  },

  /* WebKit */
  {
    test: [/(apple)?webkit/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.WebKit,
      };

      const version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    },
  },
];

/**
 * The main class that arranges the whole parsing process.
 */
class Parser {
  /**
   * Create instance of Parser
   *
   * @param {String} UA User-Agent string
   * @param {Boolean} [skipParsing=false] parser can skip parsing in purpose of performance
   * improvements if you need to make a more particular parsing
   * like {@link Parser#parseBrowser} or {@link Parser#parsePlatform}
   *
   * @throw {Error} in case of empty UA String
   *
   * @constructor
   */
  constructor(UA, skipParsing = false) {
    if (UA === void (0) || UA === null || UA === '') {
      throw new Error("UserAgent parameter can't be empty");
    }

    this._ua = UA;

    /**
     * @typedef ParsedResult
     * @property {Object} browser
     * @property {String|undefined} [browser.name]
     * Browser name, like `"Chrome"` or `"Internet Explorer"`
     * @property {String|undefined} [browser.version] Browser version as a String `"12.01.45334.10"`
     * @property {Object} os
     * @property {String|undefined} [os.name] OS name, like `"Windows"` or `"macOS"`
     * @property {String|undefined} [os.version] OS version, like `"NT 5.1"` or `"10.11.1"`
     * @property {String|undefined} [os.versionName] OS name, like `"XP"` or `"High Sierra"`
     * @property {Object} platform
     * @property {String|undefined} [platform.type]
     * platform type, can be either `"desktop"`, `"tablet"` or `"mobile"`
     * @property {String|undefined} [platform.vendor] Vendor of the device,
     * like `"Apple"` or `"Samsung"`
     * @property {String|undefined} [platform.model] Device model,
     * like `"iPhone"` or `"Kindle Fire HD 7"`
     * @property {Object} engine
     * @property {String|undefined} [engine.name]
     * Can be any of this: `WebKit`, `Blink`, `Gecko`, `Trident`, `Presto`, `EdgeHTML`
     * @property {String|undefined} [engine.version] String version of the engine
     */
    this.parsedResult = {};

    if (skipParsing !== true) {
      this.parse();
    }
  }

  /**
   * Get UserAgent string of current Parser instance
   * @return {String} User-Agent String of the current <Parser> object
   *
   * @public
   */
  getUA() {
    return this._ua;
  }

  /**
   * Test a UA string for a regexp
   * @param {RegExp} regex
   * @return {Boolean}
   */
  test(regex) {
    return regex.test(this._ua);
  }

  /**
   * Get parsed browser object
   * @return {Object}
   */
  parseBrowser() {
    this.parsedResult.browser = {};

    const browserDescriptor = Utils.find(browsersList, (_browser) => {
      if (typeof _browser.test === 'function') {
        return _browser.test(this);
      }

      if (_browser.test instanceof Array) {
        return _browser.test.some(condition => this.test(condition));
      }

      throw new Error("Browser's test function is not valid");
    });

    if (browserDescriptor) {
      this.parsedResult.browser = browserDescriptor.describe(this.getUA());
    }

    return this.parsedResult.browser;
  }

  /**
   * Get parsed browser object
   * @return {Object}
   *
   * @public
   */
  getBrowser() {
    if (this.parsedResult.browser) {
      return this.parsedResult.browser;
    }

    return this.parseBrowser();
  }

  /**
   * Get browser's name
   * @return {String} Browser's name or an empty string
   *
   * @public
   */
  getBrowserName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getBrowser().name).toLowerCase() || '';
    }
    return this.getBrowser().name || '';
  }


  /**
   * Get browser's version
   * @return {String} version of browser
   *
   * @public
   */
  getBrowserVersion() {
    return this.getBrowser().version;
  }

  /**
   * Get OS
   * @return {Object}
   *
   * @example
   * this.getOS();
   * {
   *   name: 'macOS',
   *   version: '10.11.12'
   * }
   */
  getOS() {
    if (this.parsedResult.os) {
      return this.parsedResult.os;
    }

    return this.parseOS();
  }

  /**
   * Parse OS and save it to this.parsedResult.os
   * @return {*|{}}
   */
  parseOS() {
    this.parsedResult.os = {};

    const os = Utils.find(osParsersList, (_os) => {
      if (typeof _os.test === 'function') {
        return _os.test(this);
      }

      if (_os.test instanceof Array) {
        return _os.test.some(condition => this.test(condition));
      }

      throw new Error("Browser's test function is not valid");
    });

    if (os) {
      this.parsedResult.os = os.describe(this.getUA());
    }

    return this.parsedResult.os;
  }

  /**
   * Get OS name
   * @param {Boolean} [toLowerCase] return lower-cased value
   * @return {String} name of the OS — macOS, Windows, Linux, etc.
   */
  getOSName(toLowerCase) {
    const { name } = this.getOS();

    if (toLowerCase) {
      return String(name).toLowerCase() || '';
    }

    return name || '';
  }

  /**
   * Get OS version
   * @return {String} full version with dots ('10.11.12', '5.6', etc)
   */
  getOSVersion() {
    return this.getOS().version;
  }

  /**
   * Get parsed platform
   * @return {{}}
   */
  getPlatform() {
    if (this.parsedResult.platform) {
      return this.parsedResult.platform;
    }

    return this.parsePlatform();
  }

  /**
   * Get platform name
   * @param {Boolean} [toLowerCase=false]
   * @return {*}
   */
  getPlatformType(toLowerCase = false) {
    const { type } = this.getPlatform();

    if (toLowerCase) {
      return String(type).toLowerCase() || '';
    }

    return type || '';
  }

  /**
   * Get parsed platform
   * @return {{}}
   */
  parsePlatform() {
    this.parsedResult.platform = {};

    const platform = Utils.find(platformParsersList, (_platform) => {
      if (typeof _platform.test === 'function') {
        return _platform.test(this);
      }

      if (_platform.test instanceof Array) {
        return _platform.test.some(condition => this.test(condition));
      }

      throw new Error("Browser's test function is not valid");
    });

    if (platform) {
      this.parsedResult.platform = platform.describe(this.getUA());
    }

    return this.parsedResult.platform;
  }

  /**
   * Get parsed engine
   * @return {{}}
   */
  getEngine() {
    if (this.parsedResult.engine) {
      return this.parsedResult.engine;
    }

    return this.parseEngine();
  }

  /**
   * Get engines's name
   * @return {String} Engines's name or an empty string
   *
   * @public
   */
  getEngineName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getEngine().name).toLowerCase() || '';
    }
    return this.getEngine().name || '';
  }

  /**
   * Get parsed platform
   * @return {{}}
   */
  parseEngine() {
    this.parsedResult.engine = {};

    const engine = Utils.find(enginesParsersList, (_engine) => {
      if (typeof _engine.test === 'function') {
        return _engine.test(this);
      }

      if (_engine.test instanceof Array) {
        return _engine.test.some(condition => this.test(condition));
      }

      throw new Error("Browser's test function is not valid");
    });

    if (engine) {
      this.parsedResult.engine = engine.describe(this.getUA());
    }

    return this.parsedResult.engine;
  }

  /**
   * Parse full information about the browser
   * @returns {Parser}
   */
  parse() {
    this.parseBrowser();
    this.parseOS();
    this.parsePlatform();
    this.parseEngine();

    return this;
  }

  /**
   * Get parsed result
   * @return {ParsedResult}
   */
  getResult() {
    return Utils.assign({}, this.parsedResult);
  }

  /**
   * Check if parsed browser matches certain conditions
   *
   * @param {Object} checkTree It's one or two layered object,
   * which can include a platform or an OS on the first layer
   * and should have browsers specs on the bottom-laying layer
   *
   * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
   * Returns `undefined` when the browser is no described in the checkTree object.
   *
   * @example
   * const browser = Bowser.getParser(window.navigator.userAgent);
   * if (browser.satisfies({chrome: '>118.01.1322' }))
   * // or with os
   * if (browser.satisfies({windows: { chrome: '>118.01.1322' } }))
   * // or with platforms
   * if (browser.satisfies({desktop: { chrome: '>118.01.1322' } }))
   */
  satisfies(checkTree) {
    const platformsAndOSes = {};
    let platformsAndOSCounter = 0;
    const browsers = {};
    let browsersCounter = 0;

    const allDefinitions = Object.keys(checkTree);

    allDefinitions.forEach((key) => {
      const currentDefinition = checkTree[key];
      if (typeof currentDefinition === 'string') {
        browsers[key] = currentDefinition;
        browsersCounter += 1;
      } else if (typeof currentDefinition === 'object') {
        platformsAndOSes[key] = currentDefinition;
        platformsAndOSCounter += 1;
      }
    });

    if (platformsAndOSCounter > 0) {
      const platformsAndOSNames = Object.keys(platformsAndOSes);
      const OSMatchingDefinition = Utils.find(platformsAndOSNames, name => (this.isOS(name)));

      if (OSMatchingDefinition) {
        const osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);

        if (osResult !== void 0) {
          return osResult;
        }
      }

      const platformMatchingDefinition = Utils.find(
        platformsAndOSNames,
        name => (this.isPlatform(name)),
      );
      if (platformMatchingDefinition) {
        const platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);

        if (platformResult !== void 0) {
          return platformResult;
        }
      }
    }

    if (browsersCounter > 0) {
      const browserNames = Object.keys(browsers);
      const matchingDefinition = Utils.find(browserNames, name => (this.isBrowser(name, true)));

      if (matchingDefinition !== void 0) {
        return this.compareVersion(browsers[matchingDefinition]);
      }
    }

    return undefined;
  }

  /**
   * Check if the browser name equals the passed string
   * @param browserName The string to compare with the browser name
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {boolean}
   */
  isBrowser(browserName, includingAlias = false) {
    const defaultBrowserName = this.getBrowserName().toLowerCase();
    let browserNameLower = browserName.toLowerCase();
    const alias = Utils.getBrowserTypeByAlias(browserNameLower);

    if (includingAlias && alias) {
      browserNameLower = alias.toLowerCase();
    }
    return browserNameLower === defaultBrowserName;
  }

  compareVersion(version) {
    let expectedResults = [0];
    let comparableVersion = version;
    let isLoose = false;

    const currentBrowserVersion = this.getBrowserVersion();

    if (typeof currentBrowserVersion !== 'string') {
      return void 0;
    }

    if (version[0] === '>' || version[0] === '<') {
      comparableVersion = version.substr(1);
      if (version[1] === '=') {
        isLoose = true;
        comparableVersion = version.substr(2);
      } else {
        expectedResults = [];
      }
      if (version[0] === '>') {
        expectedResults.push(1);
      } else {
        expectedResults.push(-1);
      }
    } else if (version[0] === '=') {
      comparableVersion = version.substr(1);
    } else if (version[0] === '~') {
      isLoose = true;
      comparableVersion = version.substr(1);
    }

    return expectedResults.indexOf(
      Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose),
    ) > -1;
  }

  isOS(osName) {
    return this.getOSName(true) === String(osName).toLowerCase();
  }

  isPlatform(platformType) {
    return this.getPlatformType(true) === String(platformType).toLowerCase();
  }

  isEngine(engineName) {
    return this.getEngineName(true) === String(engineName).toLowerCase();
  }

  /**
   * Is anything? Check if the browser is called "anything",
   * the OS called "anything" or the platform called "anything"
   * @param {String} anything
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {Boolean}
   */
  is(anything, includingAlias = false) {
    return this.isBrowser(anything, includingAlias) || this.isOS(anything)
      || this.isPlatform(anything);
  }

  /**
   * Check if any of the given values satisfies this.is(anything)
   * @param {String[]} anythings
   * @returns {Boolean}
   */
  some(anythings = []) {
    return anythings.some(anything => this.is(anything));
  }
}

/*!
 * Bowser - a browser detector
 * https://github.com/lancedikson/bowser
 * MIT License | (c) Dustin Diaz 2012-2015
 * MIT License | (c) Denis Demchenko 2015-2019
 */

/**
 * Bowser class.
 * Keep it simple as much as it can be.
 * It's supposed to work with collections of {@link Parser} instances
 * rather then solve one-instance problems.
 * All the one-instance stuff is located in Parser class.
 *
 * @class
 * @classdesc Bowser is a static object, that provides an API to the Parsers
 * @hideconstructor
 */
class Bowser {
  /**
   * Creates a {@link Parser} instance
   *
   * @param {String} UA UserAgent string
   * @param {Boolean} [skipParsing=false] Will make the Parser postpone parsing until you ask it
   * explicitly. Same as `skipParsing` for {@link Parser}.
   * @returns {Parser}
   * @throws {Error} when UA is not a String
   *
   * @example
   * const parser = Bowser.getParser(window.navigator.userAgent);
   * const result = parser.getResult();
   */
  static getParser(UA, skipParsing = false) {
    if (typeof UA !== 'string') {
      throw new Error('UserAgent should be a string');
    }
    return new Parser(UA, skipParsing);
  }

  /**
   * Creates a {@link Parser} instance and runs {@link Parser.getResult} immediately
   *
   * @param UA
   * @return {ParsedResult}
   *
   * @example
   * const result = Bowser.parse(window.navigator.userAgent);
   */
  static parse(UA) {
    return (new Parser(UA)).getResult();
  }

  static get BROWSER_MAP() {
    return BROWSER_MAP;
  }

  static get ENGINE_MAP() {
    return ENGINE_MAP;
  }

  static get OS_MAP() {
    return OS_MAP;
  }

  static get PLATFORMS_MAP() {
    return PLATFORMS_MAP;
  }
}

const STORAGE_NAME = 'gentle_brw_id';
var browserHandler = {
    getBrowserId() {
        const existingID = localStorage.getItem(STORAGE_NAME);
        if (existingID === null || existingID === undefined) {
            const newID = v4();
            localStorage.setItem(STORAGE_NAME, newID);
            return newID;
        }
        return existingID;
    },
    getBrowserInfo() {
        const { userAgent, language } = window.navigator;
        const browser = Bowser.parse(userAgent);
        return { ...browser, language };
    },
    getSessionId() {
        const existingID = sessionStorage.getItem(STORAGE_NAME);
        if (existingID === null || existingID === undefined) {
            const newID = String(new Date().getTime());
            sessionStorage.setItem(STORAGE_NAME, newID);
            return newID;
        }
        return existingID;
    },
};

class GentleSDK {
    baseUrl;
    browserId = null;
    browserInfo = null;
    sessionId = null;
    customerId = null;
    events = [];
    constructor({ baseUrl, customerId }) {
        if (typeof window === 'undefined')
            throw new Error('window is undefined!');
        this.baseUrl = baseUrl;
        this.browserId = browserHandler.getBrowserId();
        this.browserInfo = browserHandler.getBrowserInfo();
        this.sessionId = browserHandler.getSessionId();
        if (customerId !== undefined)
            this.customerId = customerId;
    }
    getLogProperty() {
        const clientTime = new Date().getTime();
        const logProperty = {
            sessionId: this.sessionId,
            browserId: this.browserId,
            customerId: this.customerId,
            browserInfo: this.browserInfo,
            clientTime,
        };
        return logProperty;
    }
    getUserProperty() {
        return {
            browserId: this.browserId,
            browserInfo: this.browserInfo,
            customerId: this.customerId,
            sessionId: this.sessionId,
        };
    }
    getEvents() {
        return this.events;
    }
    resetEvents() {
        this.events = [];
    }
    updateUserId(id) {
        this.customerId = id;
    }
    async track({ endPoint, event }) {
        const userProperty = this.getLogProperty();
        const log = { ...event, ...userProperty };
        this.events.push(log);
        const res = await axios.post(`${this.baseUrl}${endPoint}`, log);
        return res;
    }
}
const createGentleInstance = ({ baseUrl, customerId }) => {
    return new GentleSDK({ baseUrl, customerId });
};

exports.createGentleInstance = createGentleInstance;
