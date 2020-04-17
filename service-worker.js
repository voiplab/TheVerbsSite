let versionedCache = {
    versionId: '__SITE_VERSION__',
    staticJsonUrl: '/static.json',
    cardImagesJson: '/data/phrasal-verbs-fake.json',
    includedUrls: [
        '/',
        '/version.json',
        // image from CardPurchase.razor
        'https://images.unsplash.com/photo-1520695287272-b7f8af46d367?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
    ],
    excludedUrls: [
        '/service-worker.js',
        '/serviceworker-registration.js',
        '/static.json'
    ]
};
// Call Install Event
self.addEventListener('install', event => {        
        event.waitUntil(fillVersionedCache());

        console.debug('Service Worker: Installed');
    }
);

// Call Activate Event
self.addEventListener('activate', event => {
        async function doWork() {
            await self.clients.claim();
            await fillVersionedCache();
            await deleteOldCaches();
        }

        event.waitUntil(doWork());

        console.debug('Service Worker: Activated');
    }
);

self.addEventListener('fetch', event => {
        async function fetchPromise(requestUrl) {
            let response =
                await fetchFromCache(versionedCache.versionId, requestUrl)
                || await fetchFromNetwork(requestUrl);
            if (!response) {
                throw 'Failed to fetch request: ' + requestUrl;
            }
            return response;
        }

        event.respondWith(fetchPromise(event.request.url));
    }
);

self.addEventListener('message', async event => {
    if (event.data.action === 'skipWaiting') {
        await self.skipWaiting();
    }
});


const unique = (value, index, self) => {
    return self.indexOf(value) === index
};

async function fillVersionedCache() {
    if (!(await caches.has(versionedCache.versionId))) {
        let urlsToCache = await timeout(500, fetchFromNetworkToJson(versionedCache.staticJsonUrl));
        if (urlsToCache) {
            let cardImagesDictJson = await fetchFromNetworkToJson(versionedCache.cardImagesJson);
            let cardImageUrls = Object.keys(cardImagesDictJson).map(key => cardImagesDictJson[key].image);

            urlsToCache = urlsToCache.filter(item => !versionedCache.excludedUrls.includes(item))
                .concat(versionedCache.includedUrls)
                .concat(cardImageUrls)
                .filter(unique);

            const cache = await caches.open(versionedCache.versionId);
            try {
                await cache.addAll(urlsToCache);
                console.debug('Service Worker: Versioned cache added (id: ' + versionedCache.versionId + ')');
                return;
            } catch (e) {
                console.error('Service Worker: Failed to add versioned cache: ' + e);
                await caches.delete(versionedCache.versionId);
            }
        }
        throw new Error('Service Worker: Failed to add versioned cache')
    }
    console.debug('Service Worker: Versioned cache filled');
}

async function deleteOldCaches() {
    const cacheNames = await caches.keys();
    await cacheNames.map(cache => {
        if (cache !== versionedCache.versionId) {
            console.log(
                'Service Worker: Clearing Old Cache: ' + cache);
            return caches.delete(cache);
        }
    });
    console.debug('Service Worker: Old caches deleted'); 
}

async function fetchFromNetworkToJson(url) {
    const response = await fetchFromNetwork(url);
    if (response) {
        return await response.json();
    } else {
        return undefined;
    }
}

function timeout(ms, promise) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(undefined);
        }, ms);
        promise.then(resolve, reject)
    });
}

async function fetchFromNetwork(requestUrl) {
    try {
        return await fetch(requestUrl);
    } catch (e) {
        console.warn(e);
        return undefined;
    }
}

async function fetchFromCache(cacheName, requestUrl) {
    const cache = await caches.open(cacheName);
    return await cache.match(requestUrl) || await caches.match(requestUrl);
}