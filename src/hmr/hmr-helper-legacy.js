/* eslint-disable prefer-template, prettier/prettier, no-var, consistent-return, object-shorthand, eqeqeq */

/** Used for Legacy projects
  * IMPORTANT NOTE: This file must to be ES5 compatible
**/

'use strict';

/**************
   Polyfills
**************/

// String.endsWith
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

// String.includes
if (typeof String.prototype.includes !== 'function') {
  String.prototype.includes = function (str) {
    var returnValue = false;

    if (this.indexOf(str) !== -1) {
      returnValue = true;
    }

    return returnValue;
  }
}

// Array.find
if (typeof Array.prototype.find !== 'function') {
  Object.defineProperty(Array.prototype, 'find', {
    
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;

      while (k < len) {
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }

      return undefined;
    }
  });
}
/*******************
    END POLYFILLS
*******************/

function getScriptElement(el) {
  var url = el.getAttribute('src');
    
    // replace all after ? char
    url = url.replace(/\?.*/, '');
  
  var newScript = document.createElement('script');
  
  newScript.type = 'text/javascript';
  newScript.src = url + '?updated=' + Date.now();

  return newScript;
}

function getStyleElement(el) {
  var url = el.getAttribute('href');
  
  // replace all after ? char
  url = url.replace(/\?.*/, '');

  var newStyle = document.createElement('link');
  
  newStyle.rel = 'stylesheet';
  newStyle.href = url + '?updated=' + Date.now();

  return newStyle;
}

// ES5 compatibilty
function getAllLinks() {
  var links = Array.prototype.slice.call(document.querySelectorAll('link'));

  links = links.filter(function(el) {
    if (!el.href.includes('interface_1')) {
      return el;
    }
  })

  return links;
}

// ES5 compatibilty
function getAllScripts() {
  var scripts = Array.prototype.slice.call(document.querySelectorAll('script'));
  
  scripts = scripts.filter(function(el) {
    if (!el.src.includes('interface_1')) {
      return el;
    }
  })

  return scripts;
}

function reloadAssets(fileList) {
  // get filtered links -> interface_1 links ignored
  var links = getAllLinks();
  // get filtered scripts -> interface_1 scripts ignored
  var scripts = getAllScripts();

  fileList.forEach(function (file) {
    var el = null;

    if (file.endsWith('.css')) {
      el = links.find(function (link) {
        return link.href.includes(file);
      });

      if (el) {
        var newStyleElem = getStyleElement(el);
        
        el.parentNode.removeChild(el);
        document.head.appendChild(newStyleElem);
      }
    } else if (file.endsWith('.js') || file.endsWith('.vj')) {
      el = scripts.find(function (script) {
        return script.src.includes(file);
      });

      if (el) {
        var newScriptElem = getScriptElement(el)

        el.parentNode.removeChild(el);
        document.head.appendChild(newScriptElem);
      }
    } else if (file.endsWith('.html')) {
      // if updated index.html, reload whole index
      window.location.reload()
    }
  });
}

// Starting point

var localIp = '{{HMR_LOCAL_IP}}';
var port = '{{HMR_PORT}}';
var mode = '{{HMR_MODE}}';

if (!localIp) {
  console.error('[@pitcher/watcher]: HMR is disabled, something is wrong with your ip adress!')
}

var WS_URL = 'ws://' + localIp + ':' + port;
var socket = new WebSocket(WS_URL);

socket.onopen = function () {
  console.log('[@pitcher/watcher]: HMR enabled: ' + localIp + ':' + port + ', mode: ' + mode);
};

socket.onmessage = function (_ref) {
  var data = _ref.data;

  var res = JSON.parse(data);

  if (res.event === 'HOT_RELOAD') {
    console.log('[@pitcher/watcher]: page updated');
    reloadAssets(res.files);
  } else if (res.event === 'LIVE_RELOAD') {
    window.location.reload();
  }
};

socket.onclose = function () {
  console.error('[@pitcher/watcher]: HMR connection closed!');
};
