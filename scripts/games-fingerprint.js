/* eslint-disable no-sync */
// Emits a stable fingerprint (sha256) of the set of games that currently
// qualify for the site: those the API knows about AND that have at least one
// post. This mirrors the zero-post filter in build.js so the scheduled
// workflow can cheaply answer "has the published set of games changed since
// the last deploy?" and skip an otherwise-identical rebuild/redeploy.
//
// Prints the hex digest to stdout (nothing else) so a workflow step can
// capture it. Any failure prints nothing and exits non-zero, which the caller
// treats as "can't tell -> deploy anyway" (fail safe, never skip on error).
// quiet: true so dotenv's tip banner doesn't land on stdout — this script's
// stdout must be the bare digest and nothing else (the workflow captures it).
require( 'dotenv' ).config( { quiet: true } );

const https = require( 'https' );
const url = require( 'url' );
const crypto = require( 'crypto' );

if ( !process.env.API_TOKEN ) {
    throw new Error( 'Unable to load api key' );
}

const API_HOST = 'api.developertracker.com';
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 1000;
const REQUEST_TIMEOUT_MS = 60000;
const REQUEST_CONCURRENCY = 6;

const sleep = function sleep( ms ) {
    return new Promise( ( resolve ) => {
        setTimeout( resolve, ms );
    } );
};

const attemptGet = function attemptGet( requestUrl, headers = false ) {
    return new Promise( ( resolve, reject ) => {
        let httpsGet = requestUrl;
        if ( headers ) {
            const urlParts = url.parse( requestUrl );

            httpsGet = {
                headers: headers,
                hostname: urlParts.hostname,
                path: urlParts.path,
                port: urlParts.port || 443,
            };
        }

        const request = https.get( httpsGet, ( response ) => {
            if ( response.statusCode < 200 || response.statusCode > 299 ) {
                const statusError = new Error( `Failed to load ${ requestUrl }, status code: ${ response.statusCode }` );
                statusError.statusCode = response.statusCode;
                response.resume();
                reject( statusError );

                return;
            }

            const body = [];
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

        request.setTimeout( REQUEST_TIMEOUT_MS, () => {
            request.destroy( new Error( `Timed out after ${ REQUEST_TIMEOUT_MS }ms loading ${ requestUrl }` ) );
        } );
    } );
};

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

            await sleep( RETRY_BACKOFF_MS * attempt );
        }
    }

    throw lastError;
};

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

const run = async function run() {
    const gamesResponse = await promiseGet( `https://${ API_HOST }/games`, {
        Authorization: `Bearer ${ process.env.API_TOKEN }`,
    } );
    const identifiers = JSON.parse( gamesResponse ).data.map( ( gameConfig ) => {
        return gameConfig.identifier;
    } );

    const qualifying = [];

    // Mirror build.js: a game qualifies when the posts endpoint returns at
    // least one row. On a per-game probe error we FAIL the whole fingerprint
    // (throw) rather than guess — a wrong fingerprint could wrongly skip a
    // deploy, so an unknowable state must fall through to "deploy anyway".
    const thunks = identifiers.map( ( identifier ) => {
        return async () => {
            const postsResponse = await promiseGet( `https://${ API_HOST }/${ identifier }/posts?limit=1` );
            const posts = JSON.parse( postsResponse ).data;

            if ( Array.isArray( posts ) && posts.length > 0 ) {
                qualifying.push( identifier );
            }
        };
    } );

    await mapWithConcurrency( thunks, REQUEST_CONCURRENCY, ( thunk ) => {
        return thunk();
    } );

    qualifying.sort();

    const digest = crypto.createHash( 'sha256' )
        .update( qualifying.join( '\n' ) )
        .digest( 'hex' );

    process.stdout.write( digest );
};

run()
    .catch( ( fingerprintError ) => {
        process.stderr.write( `Fingerprint failed: ${ fingerprintError.message }\n` );
        process.exitCode = 1;
    } );
