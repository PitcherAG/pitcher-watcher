/* eslint-disable prefer-template, prettier/prettier, no-var */

/** Used for Vue based projects
  * IMPORTANT NOTE: This file must be ES5 compatible
**/

'use strict';

function removeCurrentFiles(fileList) {
  var links = Array.from(document.querySelectorAll('link'));
  var scripts = Array.from(document.querySelectorAll('script'));

  fileList.forEach(function (file) {
    var el = null;

    if (file.endsWith('.css')) {
      el = links.find(function (link) {
        return link.href.includes(file);
      });
    } else if (file.endsWith('.js')) {
      el = scripts.find(function (script) {
        return script.src.includes(file);
      });
    }

    if (el) {
      el.parentNode.removeChild(el);
    }
  });
}

function injectNewFiles(fileList) {
  fileList.forEach(function (file) {
    var newElement = null;
    var url = file + '?updated=' + Date.now();

    if (file.endsWith('.css')) {
      newElement = document.createElement('link');
      newElement.rel = 'stylesheet';
      newElement.href = url;
      document.head.appendChild(newElement);
    }
    if (file.endsWith('.js')) {
      newElement = document.createElement('script');
      newElement.type = 'text/javascript';
      newElement.src = url;
      document.body.appendChild(newElement);
    }
  });
}

// Starting point

if (process.env.VUE_APP_HMR) {
  var localIp = process.env.VUE_APP_HMR_IP
  var port = process.env.VUE_APP_HMR_PORT || 8099

  if (!localIp) {
    console.error('[@pitcher/watcher]: HMR is disabled, something is wrong with your ip adress!')
  }

  var WS_URL = 'ws://' + localIp + ':' + port;
  var socket = new WebSocket(WS_URL);
  
  socket.onopen = function () {
    console.log('[@pitcher/watcher]: HMR enabled: ' + localIp + ':' + port + ', mode: ' + process.env.VUE_APP_HMR_MODE);
  };
  
  socket.onmessage = function (_ref) {
    var data = _ref.data;

    var res = JSON.parse(data);

    if (res.event === 'HOT_RELOAD') {
      console.log('[@pitcher/watcher]: page updated');
      removeCurrentFiles(res.files.current);
      injectNewFiles(res.files.updated);
    } else if (res.event === 'LIVE_RELOAD') {
      window.location.reload();
    }
  };

  socket.onclose = function () {
    console.error('[@pitcher/watcher]: HMR connection closed!');
  };
}
