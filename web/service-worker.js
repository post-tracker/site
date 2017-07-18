/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const ASSET_CACHE = 'precache-{{version}}';

// A list of local resources we always want to be cached.
const PRECACHE_ASSETS = [
    'index.html',
    './',
    './assets/styles.min.css?v={{version}}',
    './assets/loader.svg',
    './scripts/app.js?v={{version}}',
    'manifest.json',
];

const cacheOrNetwork = function cacheOrNetwork( event ) {
    event.respondWith(
        caches.match( event.request )
            .then( ( cachedResponse ) => {
                if ( cachedResponse ) {
                    return cachedResponse;
                }

                return fetch( event.request )
                    .then( ( response ) => {
                        return response;
                    } );
            } )
    );
};

// The install handler takes care of precaching the resources we always need.
self.addEventListener( 'install', ( event ) => {
    event.waitUntil(
        caches.open( ASSET_CACHE )
            .then( ( cache ) => {
                cache.addAll( PRECACHE_ASSETS );
            } )
            .then( self.skipWaiting() )
            .catch( ( someError ) => {
                console.log( someError ) ;
            } )
    );
} );

// The activate handler takes care of cleaning up old caches.
self.addEventListener( 'activate', ( event ) => {
    const currentCaches = [
        ASSET_CACHE,
    ];

    event.waitUntil(
        caches.keys()
            .then( ( cacheNames ) => {
                return cacheNames.filter( ( cacheName ) => {
                    return !currentCaches.includes( cacheName );
                } );
            } )
            .then( ( cachesToDelete ) => {
                return Promise.all( cachesToDelete.map( ( cacheToDelete ) => {
                    return caches.delete( cacheToDelete );
                } ) );
            } )
            .then( () => {
                self.clients.claim();
            } )
            .catch( ( someError ) => {
                console.log( someError );
            } )
    );
} );

self.addEventListener( 'fetch', ( event ) => {
    if ( event.request.url.startsWith( self.location.origin ) ) {
        cacheOrNetwork( event );
    }
} );
