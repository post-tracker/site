/* eslint-disable no-sync */
require( 'dotenv' ).config();

const path = require( 'path' );
const https = require( 'https' );
const url = require( 'url' );
const fs = require( 'fs' );

const mustache = require( 'mustache' );
const junk = require( 'junk' );
const recursive = require( 'recursive-readdir' );

const gamecss = require( './modules/gamecss' );
const savefile = require( './modules/savefile' );
const sleep = require('./modules/sleep');

if ( !process.env.API_TOKEN ) {
    throw new Error( 'Unable to load api key' );
}

const API_HOST = 'api.developertracker.com';
const STAGE_PATH = path.join( __dirname, '..', 'stage' );
// const API_HOST = 'localhost:3000';
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// The API is self-hosted behind Cloudflare and occasionally returns a transient
// gateway error (502/503/504/522) or stalls. Retry those a few times with a
// short backoff so one hiccup doesn't fail the whole deploy. The timeout is a
// generous backstop against a truly hung request — the build fires many
// requests concurrently, so it must stay well above normal-under-load latency
// to avoid aborting slow-but-healthy responses.
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 1000;
const REQUEST_TIMEOUT_MS = 60000;

// Cap how many requests are in flight at once. The API's DB connection pool is
// finite, so firing one request per game with no bound (services + groups for
// ~50 games) stampedes it into "ResourceRequest timed out". A small cap keeps
// the build a good citizen while still being far faster than serializing.
const REQUEST_CONCURRENCY = 6;

const attemptGet = function attemptGet( requestUrl, headers = false ) {
    return new Promise( ( resolve, reject ) => {
        let httpsGet = requestUrl;
        if ( headers ) {
            const urlParts = url.parse( requestUrl );

            httpsGet = {
                headers: headers,
                hostname: urlParts.hostname,
                path: urlParts.path,
                port: urlParts.port || 443,
            };
        }

        console.log( `Loading ${ requestUrl }` );

        const request = https.get( httpsGet, ( response ) => {
            if ( response.statusCode < 200 || response.statusCode > 299 ) {
                const statusError = new Error( `Failed to load ${ requestUrl }, status code: ${ response.statusCode }` );
                statusError.statusCode = response.statusCode;
                // Drain so the socket can be freed/reused.
                response.resume();
                reject( statusError );

                return;
            }

            const body = [];

            console.log( `Done with ${ requestUrl }` );

            response.on( 'data', ( chunk ) => {
                body.push( chunk );
            } );

            response.on( 'end', () => {
                resolve( body.join( '' ) );
            } );
        } );

        request.on( 'error', ( requestError ) => {
            reject( requestError );
        } );

        // Don't let a stalled request hang the build; destroying it surfaces as
        // an 'error' above, which the retry layer treats as transient.
        request.setTimeout( REQUEST_TIMEOUT_MS, () => {
            request.destroy( new Error( `Timed out after ${ REQUEST_TIMEOUT_MS }ms loading ${ requestUrl }` ) );
        } );
    } );
};

// 5xx and network-level failures are transient and worth retrying; 4xx are not
// (they won't self-heal), so we surface those immediately.
const isRetryable = function isRetryable( requestError ) {
    if ( typeof requestError.statusCode === 'number' ) {
        return requestError.statusCode >= 500;
    }

    return true;
};

const promiseGet = async function promiseGet( requestUrl, headers = false ) {
    let lastError;

    for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt = attempt + 1 ) {
        try {
            return await attemptGet( requestUrl, headers );
        } catch ( requestError ) {
            lastError = requestError;

            if ( attempt >= MAX_ATTEMPTS || !isRetryable( requestError ) ) {
                break;
            }

            console.log( `Attempt ${ attempt }/${ MAX_ATTEMPTS } failed for ${ requestUrl } (${ requestError.message }); retrying in ${ RETRY_BACKOFF_MS * attempt }ms` );
            await sleep( RETRY_BACKOFF_MS * attempt );
        }
    }

    throw lastError;
};

// Run `worker` over `items` with at most `limit` concurrent invocations. Workers
// mutate shared state by side effect (they don't return anything we collect), so
// this just resolves once every item has been processed.
const mapWithConcurrency = async function mapWithConcurrency( items, limit, worker ) {
    let cursor = 0;

    const runNext = async function runNext() {
        while ( cursor < items.length ) {
            const index = cursor;
            cursor = cursor + 1;
            await worker( items[ index ] );
        }
    };

    const runners = [];
    for ( let i = 0; i < Math.min( limit, items.length ); i = i + 1 ) {
        runners.push( runNext() );
    }

    await Promise.all( runners );
};

const getGames = async function getGames() {
    let allGamesConfig;
    const gamesConfig = {};

    try {
        const gamesConfigResponse = await promiseGet( `https://${ API_HOST }/games`, {
            Authorization: `Bearer ${ process.env.API_TOKEN }`,
        } );
        allGamesConfig = JSON.parse( gamesConfigResponse );
    } catch ( getGamesError ) {
        console.log( `Unable to load games. Got "${ getGamesError.message }"` );

        throw getGamesError;
    }

    allGamesConfig.data.forEach( ( gameConfig ) => {
        gamesConfig[ gameConfig.identifier ] = gameConfig;
    } );

    return gamesConfig;
};

const buildGame = function buildGame( gameData ) {
    console.log( `Building ${ gameData.identifier }` );
    const gameFilesPath = path.join( __dirname, '..', 'games', gameData.identifier );
    const rewriteFiles = [
        'index.html',
        'service-worker.js',
    ];
    const dataRootPath = path.join( __dirname, '..', 'web' );

    // Upload all default files
    recursive( dataRootPath, ( readDirError, files ) => {
        if ( readDirError ) {
            throw readDirError;
        }

        fileLoop:
        for ( const file of files ) {
            if ( junk.is( path.parse( file ).base ) ) {
                continue;
            }
            const fileName = path.join( gameData.identifier, file.replace( dataRootPath, '' ) )

            // Don't upload files we'll rewrite
            for ( const rewriteFile of rewriteFiles ) {
                if ( fileName.includes( rewriteFile ) ) {
                    continue fileLoop;
                }
            }

            savefile( fileName, fs.readFileSync( file ) );
        }
    } );

    savefile( path.join( gameData.identifier, '/assets/theme-dark.min.css' ), gameData.themeDark );
    savefile( path.join( gameData.identifier, '/assets/theme-light.min.css' ), gameData.themeLight );

    recursive( gameFilesPath, ( gameFilesError, gameFiles ) => {
        if ( gameFilesError ) {
            console.log( `No game files found for ${ gameData.identifier } ` );
            gameFiles = [];
        }

        for ( const filename of gameFiles ) {
            if ( junk.is( path.parse( filename ).base ) ) {
                continue;
            }

            if ( filename.includes( 'styles.css' ) ) {
                gameData.styles = fs.readFileSync( filename );
            }

            if ( filename.includes( 'assets/logo.png' ) ) {
                gameData.logo = '<img src="assets/logo.png" class="header-logo">';
            }

            savefile( path.join( gameData.identifier, filename.replace( gameFilesPath, '' ) ), fs.readFileSync( filename ) );
        }

        if ( !gameData.logo ) {
            gameData.logo = gameData.shortName;
        }

        for ( let i = 0; i < rewriteFiles.length; i = i + 1 ) {
            // Fill in the data where needed
            fs.readFile( path.join( dataRootPath, rewriteFiles[ i ] ), 'utf8', ( readFileError, fileData ) => {
                if ( readFileError ) {
                    console.error( readFileError );

                    return false;
                }

                savefile( path.join( gameData.identifier, rewriteFiles[ i ] ), mustache.render( fileData, gameData ) );

                return true;
            } );
        }
    } );

    console.log( `Build ${ gameData.identifier } done` );
};

// Patreon supporters are maintained by hand in supporters.json (an array of
// names). Returns objects shaped for the {{#supporters}} section in the landing
// template. A missing or empty file just means the footer shows its "you?"
// fallback, so the build never fails over it.
const loadSupporters = function loadSupporters() {
    const supportersPath = path.join( __dirname, '..', 'supporters.json' );

    let names;
    try {
        names = JSON.parse( fs.readFileSync( supportersPath, 'utf8' ) );
    } catch ( supportersError ) {
        if ( supportersError.code !== 'ENOENT' ) {
            console.log( `Unable to read supporters.json, skipping. Got "${ supportersError.message }"` );
        }

        return [];
    }

    if ( !Array.isArray( names ) ) {
        console.log( 'supporters.json is not an array, skipping' );

        return [];
    }

    return names
        .filter( ( name ) => {
            return typeof name === 'string' && name.trim().length > 0;
        } )
        .map( ( name ) => {
            return {
                name: name.trim(),
            };
        } );
};

const buildRootPage = function buildRootPage( gamesData ){
    const allGamesTemplate = fs.readFileSync( path.join( __dirname, '..', 'web-assets', 'games-template.html' ), 'utf8' );
    const games = Object.values( gamesData );
    const renderData = {
        games: [],
        supporters: loadSupporters(),
    };

    games.sort( ( a, b ) => {
        return a.name.localeCompare( b.name );
    } );

    for ( let i = 0; i < games.length; i = i + 1 ) {
        // Skip games with no config (no boxart etc). Offline games (config.live
        // falsy) still build — "offline" now only stops indexing, not the site.
        if ( !games[ i ].config ) {
            continue;
        }

        let name = games[ i ].name;
        let image = games[ i ].config.boxart;

        // Single-domain: every game lives at /<identifier>/ on whatever host
        // serves this page, so the link is relative — a visitor on www stays on
        // www instead of being bounced to the apex (or pages.dev). The stored
        // game.hostname (now always developertracker.com or empty) is ignored.
        const url = `/${ games[ i ].identifier }/`;

        renderData.games.push( {
            url,
            image,
            name,
        } );
    }

    savefile( 'index.html', mustache.render( allGamesTemplate, renderData ) );
};

// Cloudflare Pages reads a single _headers file at the deploy root. These rules
// replicate the per-object Cache-Control policy that the old S3 upload set.
// `*` is a splat (matches across path segments), so `/*.css` covers nested
// per-game assets like /anthem/assets/theme-dark.min.css.
//
// Pages *combines* the headers of every matching rule (it does not let a later
// rule override an earlier one), so overlapping globs on the same header would
// emit a doubled Cache-Control. Pages also honors only a single `*` splat per
// pattern (a multi-segment pattern like /*/scripts/*.js silently matches
// nothing). The only long-cache JS is the per-game bundle /<game>/scripts/app.js,
// so the js rule is /*app.js — one splat, matches the bundle but not
// /<game>/service-worker.js, leaving the service-worker rule below as the only
// rule that applies to the worker.
const buildHeaders = function buildHeaders() {
    const headers = [
        '/*.html',
        '  Cache-Control: public, max-age=600',
        '/*.css',
        '  Cache-Control: public, max-age=31536000',
        '/*app.js',
        '  Cache-Control: public, max-age=31536000',
        '/*.jpg',
        '  Cache-Control: public, max-age=2678400',
        '/*.jpeg',
        '  Cache-Control: public, max-age=2678400',
        '/*.gif',
        '  Cache-Control: public, max-age=2678400',
        '/*.png',
        '  Cache-Control: public, max-age=2678400',
        '/*.ico',
        '  Cache-Control: public, max-age=2678400',
        '/*.svg',
        '  Cache-Control: public, max-age=2678400',
        '/*.woff',
        '  Cache-Control: public, max-age=2678400',
        '/*.woff2',
        '  Cache-Control: public, max-age=2678400',
        '/*.mp4',
        '  Cache-Control: public, max-age=2678400',
        '/*.webm',
        '  Cache-Control: public, max-age=2678400',
        '/*.json',
        '  Cache-Control: public, max-age=2678400',
        '/*.xml',
        '  Cache-Control: public, max-age=2678400',
        '/*service-worker.js',
        '  Cache-Control: public, max-age=600, must-revalidate',
        '',
    ];

    savefile( '_headers', headers.join( '\n' ) );
};

// The per-game folders get a copy of web/ via buildGame, but the root landing
// page also references favicons/manifest (apple-touch-icon.png, site.webmanifest,
// safari-pinned-tab.svg, etc.). Copy web/'s top-level static files to the deploy
// root so those resolve. Skip index.html (the per-game template, not the landing
// page) and service-worker.js (rewritten per game, not served at root).
const buildRootAssets = function buildRootAssets() {
    const dataRootPath = path.join( __dirname, '..', 'web' );
    const skip = [
        'index.html',
        'service-worker.js',
    ];

    for ( const entry of fs.readdirSync( dataRootPath, { withFileTypes: true } ) ) {
        if ( !entry.isFile() || junk.is( entry.name ) || skip.includes( entry.name ) ) {
            continue;
        }

        savefile( entry.name, fs.readFileSync( path.join( dataRootPath, entry.name ) ) );
    }
};

const run = async function run() {
    let games;

    // Always start from a clean output tree; everything is rebuilt below and
    // then deployed to Cloudflare Pages.
    try {
        fs.rmSync( STAGE_PATH, {
            recursive: true,
        } );
    } catch( removeError ) {
        if ( removeError.code !== 'ENOENT' ) {
            console.error( removeError );
        }
    }

    try {
        games = await getGames();
    } catch ( loadGamesError ) {
        console.error( 'Failed to load games from the API, not building' );

        // Fail the process so CI stops here with a clear reason instead of
        // continuing to a deploy step that finds no generated output.
        process.exitCode = 1;

        return false;
    }
    const addGameProperty = function addGameProperty( property, value ) {
        for ( const identifier in games ) {
            games[ identifier ][ property ] = value;
        }
    };
    addGameProperty( 'version', Date.now() );
    addGameProperty( 'defaultTheme', 'light' );

    const identifiers = Object.keys( games );

    const serviceThunks = identifiers.map( ( identifier ) => {
        return async () => {
            const servicesResponse = await promiseGet( `https://${ API_HOST }/${ identifier }/services` );
            let services = JSON.parse( servicesResponse ).data;

            // If we only have one service, treat it as none
            if ( services.length === 1 ) {
                services = [];
            }

            // Transform service names to objects
            services = services.map( ( name ) => {
                let label = name;
                if ( games[ identifier ].config && games[ identifier ].config.sources && games[ identifier ].config.sources[ name ] ) {
                    label = games[ identifier ].config.sources[ name ].label || name;
                }

                return {
                    active: true,
                    name: name,
                    label: label,
                };
            } );

            services.sort( ( a,b ) => {
                return a.label.localeCompare( b.label );
            } );

            games[ identifier ].services = JSON.stringify( services );
        };
    } );

    const groupThunks = identifiers.map( ( identifier ) => {
        return async () => {
            const groupsResponse = await promiseGet( `https://${ API_HOST }/${ identifier }/groups` );
            let groups = JSON.parse( groupsResponse ).data;

            // If we only have one group, treat it as none
            if ( groups.length === 1 ) {
                groups = [];
            }

            // Transform group names to objects
            groups = groups.map( ( name ) => {
                return {
                    active: true,
                    name: name,
                };
            } );

            games[ identifier ].groups = JSON.stringify( groups );
        };
    } );

    // Bounded concurrency so a burst of requests does not exhaust the API's
    // DB connection pool (which surfaces as "ResourceRequest timed out").
    await mapWithConcurrency( serviceThunks, REQUEST_CONCURRENCY, ( thunk ) => {
        return thunk();
    } );
    await mapWithConcurrency( groupThunks, REQUEST_CONCURRENCY, ( thunk ) => {
        return thunk();
    } );

    for ( const identifier in games ) {
        games[ identifier ].themeDark = gamecss( identifier, 'dark' );
        games[ identifier ].themeLight = gamecss( identifier, 'light' );

        if ( games[ identifier ].config && games[ identifier ].config.defaultTheme ) {
            games[ identifier ].defaultTheme = games[ identifier ].config.defaultTheme;
        }
    }

    for ( const gameIdentifier in games ) {
        buildGame( games[ gameIdentifier ] );
    }

    buildRootPage( games );
    buildHeaders();
    buildRootAssets();
};

run()
    .catch( ( buildError ) => {
        console.error( 'Build failed:', buildError );

        // Non-zero exit so CI fails at this step rather than deploying nothing.
        process.exitCode = 1;
    } );
