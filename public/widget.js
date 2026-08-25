(function() {
  // Find current script tag to extract tenant ID and position
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && (scripts[i].src.indexOf('widget.js') !== -1 || scripts[i].src.indexOf('widget') !== -1)) {
        return scripts[i];
      }
    }
    return scripts[scripts.length - 1];
  })();

  if (!currentScript) return;

  var tenantId = currentScript.getAttribute('data-tenant') || '00000000-0000-0000-0000-000000000000';
  var baseUrl = 'https://lockquote.atypikalstudio.dev';
  if (currentScript.src) {
    try {
      var urlObj = new URL(currentScript.src);
      baseUrl = urlObj.origin;
    } catch (e) {
      baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf('/'));
    }
  }

  // Create container div matching max-w-lg (512px) with zero extra wrapper styling
  var container = document.createElement('div');
  container.className = 'locksmith-quote-widget-container';
  container.style.width = '100%';
  container.style.maxWidth = '512px';
  container.style.margin = '0 auto';
  container.style.padding = '0';
  container.style.border = 'none';
  container.style.background = 'transparent';
  container.style.boxShadow = 'none';
  container.style.overflow = 'hidden';

  // Create iframe
  var iframe = document.createElement('iframe');
  var widgetUrl = baseUrl + '/widget';
  if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000000') {
    widgetUrl += '?tenant=' + encodeURIComponent(tenantId);
  }
  iframe.src = widgetUrl;
  iframe.title = 'Instant Locksmith Quote Wizard';
  iframe.allow = 'geolocation';
  iframe.setAttribute('scrolling', 'no');
  iframe.style.width = '100%';
  iframe.style.height = '672px';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.background = 'transparent';
  iframe.style.transition = 'height 0.2s ease-out';
  iframe.style.display = 'block';

  container.appendChild(iframe);

  // Insert container before the script tag
  currentScript.parentNode.insertBefore(container, currentScript);

  // Listen for resize messages from the iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'resize-widget' && typeof event.data.height === 'number') {
      if (event.data.height > 200 && event.data.height < 1400) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
})();
