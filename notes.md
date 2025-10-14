Update applied: I restricted the service worker in sw.js so it no longer intercepts cross-origin requests or non-GET methods (which were likely breaking streaming API/download responses). I restarted the frontend container so the changed sw.js is served.

What I changed (high level)

Only handle same-origin GET requests in the fetch handler.
Let cross-origin requests and non-GET methods bypass the ServiceWorker.
Use network-first for navigation requests, fallback to cache for offline.