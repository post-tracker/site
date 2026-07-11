// Per-game "unread" tracking for the post feed (issues #14 + #59).
//
// We keep a single "last seen" watermark per game in localStorage
// (`lastSeen:<game>` = the newest post timestamp the user has seen). A post is
// considered unread when its timestamp is newer than the watermark captured at
// page load. The watermark is snapshotted ONCE per game per session so that
// re-renders, searches and filter/service toggles don't keep re-baselining —
// posts flagged "new" stay flagged for the whole visit. On the next visit the
// stored watermark has advanced past them, so they're no longer new.
//
// #14: getUnreadMap() drives the "New" marker on each post.
// #59: commitSeen() advances the watermark and mirrors the unread count onto
//      the installed-PWA app icon via the Badging API (feature-detected).

const STORAGE_PREFIX = 'lastSeen:';

const getGame = function getGame () {
    return window.game || 'default';
};

const readWatermark = function readWatermark ( game ) {
    let raw;

    try {
        raw = localStorage.getItem( `${ STORAGE_PREFIX }${ game }` );
    } catch ( storageError ) {
        // Storage disabled (private mode etc.) — treat as "nothing seen yet".
        return 0;
    }

    const parsed = parseInt( raw, 10 );

    return Number.isFinite( parsed ) ? parsed : 0;
};

const writeWatermark = function writeWatermark ( game, value ) {
    try {
        localStorage.setItem( `${ STORAGE_PREFIX }${ game }`, String( value ) );
    } catch ( storageError ) {
        // Storage disabled — unread simply won't persist across visits.
    }
};

// Watermark as it was when the page loaded, cached per game so every read this
// session compares against the same baseline (not a value we've since advanced).
const sessionBaseline = {};

const getBaseline = function getBaseline ( game ) {
    if ( typeof sessionBaseline[ game ] === 'undefined' ) {
        sessionBaseline[ game ] = readWatermark( game );
    }

    return sessionBaseline[ game ];
};

const setAppBadge = function setAppBadge ( count ) {
    // Badging API is only meaningful for an installed PWA and isn't universally
    // supported — feature-detect and no-op everywhere else so nothing breaks.
    if ( !navigator.setAppBadge || !navigator.clearAppBadge ) {
        return;
    }

    if ( count > 0 ) {
        navigator.setAppBadge( count ).catch( () => {} );
    } else {
        navigator.clearAppBadge().catch( () => {} );
    }
};

// #14 — map of urlHash -> true for every post newer than the session baseline.
// Pure read (no side effects); safe to call from render.
export const getUnreadMap = function getUnreadMap ( posts ) {
    const baseline = getBaseline( getGame() );
    const unread = {};

    posts.forEach( ( post ) => {
        const timestamp = Number( post.timestamp );

        if ( Number.isFinite( timestamp ) && timestamp > baseline ) {
            unread[ post.urlHash ] = true;
        }
    } );

    return unread;
};

// #59 (+ persistence) — advance the stored watermark to the newest post and
// mirror the unread count onto the app icon. Call from a lifecycle hook when
// the post list changes, never from render.
export const commitSeen = function commitSeen ( posts ) {
    const game = getGame();
    const baseline = getBaseline( game );
    let newest = baseline;
    let unreadCount = 0;

    posts.forEach( ( post ) => {
        const timestamp = Number( post.timestamp );

        if ( !Number.isFinite( timestamp ) ) {
            return;
        }

        if ( timestamp > baseline ) {
            unreadCount = unreadCount + 1;
        }

        if ( timestamp > newest ) {
            newest = timestamp;
        }
    } );

    // Only ever move the watermark forward — a filtered subfeed (fewer posts)
    // must not roll it back below what a previous fetch already recorded.
    if ( newest > readWatermark( game ) ) {
        writeWatermark( game, newest );
    }

    setAppBadge( unreadCount );
};
