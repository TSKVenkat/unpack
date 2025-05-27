// Plausible Analytics snippet
(function () {
  var d = document, s = d.createElement('script');
  s.src = 'https://plausible.io/js/plausible.js';
  s.async = true;
  s.defer = true;
  s.setAttribute('data-domain', window.location.hostname);
  d.head.appendChild(s);
})(); 