(function () {
  // Prevent duplicate script execution
  if (window.LocksmithQuoteLoaded) return;
  window.LocksmithQuoteLoaded = true;

  // Find script element to extract parameters
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (
          scripts[i].src &&
          (scripts[i].src.indexOf('widget-popup') !== -1 ||
            scripts[i].src.indexOf('widget.popup') !== -1 ||
            scripts[i].src.indexOf('widjet-popup') !== -1 ||
            scripts[i].src.indexOf('widget.popiup') !== -1)
        ) {
          return scripts[i];
        }
      }
      return scripts[scripts.length - 1];
    })();

  var tenantId =
    (currentScript && currentScript.getAttribute('data-tenant')) ||
    '00000000-0000-0000-0000-000000000000';

  var showFloatingButton =
    !currentScript || currentScript.getAttribute('data-button') !== 'false';

  var buttonText =
    (currentScript && currentScript.getAttribute('data-button-text')) ||
    '🔑 Get Instant Quote';

  var baseUrl = 'https://lockquote.atypikalstudio.dev';
  if (currentScript && currentScript.src) {
    try {
      var urlObj = new URL(currentScript.src);
      baseUrl = urlObj.origin;
    } catch (e) {
      // Fallback to default
    }
  }

  var isOpen = false;
  var overlay = null;
  var container = null;
  var iframe = null;

  function openModal() {
    if (!overlay || !iframe) {
      setupDOM();
    }
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href) {
      var widgetUrl = baseUrl + '/widget';
      if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000000') {
        widgetUrl += '?tenant=' + encodeURIComponent(tenantId);
      }
      iframe.src = widgetUrl;
    }
    overlay.classList.add('locksmith-modal-open');
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }
    isOpen = true;
  }

  function closeModal() {
    if (overlay) {
      overlay.classList.remove('locksmith-modal-open');
    }
    if (document.body) {
      document.body.style.overflow = '';
    }
    isOpen = false;
  }

  function setupDOM() {
    if (overlay) return; // already created
    if (!document.body) return; // wait until body exists

    // Inject CSS styles into head matching the native widget modal
    var style = document.getElementById('locksmith-quote-widget-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'locksmith-quote-widget-styles';
      style.textContent = `
        .locksmith-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.80);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }
        .locksmith-modal-overlay.locksmith-modal-open {
          opacity: 1;
          visibility: visible;
        }
        .locksmith-modal-container {
          position: relative;
          width: 100%;
          max-width: 512px;
          height: auto;
          max-height: 96vh;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.96);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s ease-out;
        }
        .locksmith-modal-overlay.locksmith-modal-open .locksmith-modal-container {
          transform: scale(1);
        }
        .locksmith-modal-iframe {
          width: 100%;
          height: 672px;
          max-height: 96vh;
          border: none !important;
          display: block;
          background: transparent !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          transition: height 0.2s ease-out;
        }
        .locksmith-modal-iframe::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .locksmith-floating-btn {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 999990;
          background: #00d492;
          color: #022c22;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 14px;
          padding: 14px 22px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .locksmith-floating-btn:hover {
          background: #d15d0b;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        }
        .locksmith-floating-btn:active {
          transform: translateY(0) scale(0.98);
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    // Create DOM Elements
    overlay = document.createElement('div');
    overlay.className = 'locksmith-modal-overlay';
    overlay.id = 'locksmith-quote-modal-overlay';

    container = document.createElement('div');
    container.className = 'locksmith-modal-container';

    iframe = document.createElement('iframe');
    iframe.className = 'locksmith-modal-iframe';
    iframe.id = 'locksmith-quote-iframe';
    iframe.title = 'Instant Locksmith Quote Wizard';
    iframe.allow = 'geolocation';
    iframe.setAttribute('scrolling', 'no');
    iframe.style.overflow = 'hidden';

    container.appendChild(iframe);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Close when clicking overlay backdrop
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Prevent clicks inside container from closing
    container.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Create Floating Trigger Button if enabled
    if (showFloatingButton) {
      var floatingBtn = document.createElement('button');
      floatingBtn.className = 'locksmith-floating-btn';
      floatingBtn.type = 'button';
      floatingBtn.innerHTML = buttonText;
      floatingBtn.addEventListener('click', openModal);
      document.body.appendChild(floatingBtn);
    }
  }

  // Safe bootstrap function that runs when DOM is ready
  function bootstrap() {
    if (document.body) {
      setupDOM();
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDOM);
      } else {
        window.addEventListener('load', setupDOM);
      }
    }
  }

  bootstrap();

  // Close on ESC key
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  });

  // Handle postMessages from iframe
  window.addEventListener('message', function (event) {
    if (!event.data) return;
    if (event.data.type === 'close-widget') {
      closeModal();
    } else if (event.data.type === 'resize-widget' && typeof event.data.height === 'number') {
      if (event.data.height > 200 && event.data.height < 1400) {
        var isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        var maxRatio = isMobile ? 0.96 : 0.90;
        var targetH = Math.min(event.data.height, Math.floor(window.innerHeight * maxRatio));
        if (iframe) iframe.style.height = targetH + 'px';
        if (container) container.style.height = targetH + 'px';
      }
    }
  });

  // Event Delegation for trigger elements with data-open-locksmith-quote or .open-locksmith-quote
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-locksmith-quote], .open-locksmith-quote, [href="#get-locksmith-quote"], [href="#instant-quote"]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  // Expose Global Window API for programmatic triggering
  window.LocksmithQuote = {
    open: openModal,
    close: closeModal,
    toggle: function () {
      if (isOpen) closeModal();
      else openModal();
    },
  };
})();
