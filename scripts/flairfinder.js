const fs = require( 'fs' );
const path = require( 'path' );
const https = require( 'https' );

const SKIP_FLAIRS = [
    '/r/globaloffensive janitor',
    '/r/globaloffensive moderator',
    '/r/globaloffensive monsorator',
    '3dmax fan',
    '400k hype',
    '5 year subreddit veteran',
    'astana dragons fan',
    'astralis fan',
    'baggage veteran',
    'banner competition #2 second place winner',
    'banner competition #2 third place winner',
    'bloodhound',
    'bravado gaming fan',
    'bravo',
    'cache veteran',
    'chroma',
    'clan-mystik fan',
    'cloud9 fan',
    'cloud9 g2a fan',
    'cobblestone veteran',
    'complexity fan',
    'copenhagen wolves fan',
    'counter logic gaming fan',
    'dat team fan',
    'dust 2 veteran',
    'envyus fan',
    'epsilon esports fan',
    'esc gaming fan',
    'faze clan fan',
    'flipsid3 tactics fan',
    'flipside tactics fan',
    'fnatic fan',
    'fnatic fanatic',
    'g2 esports fan',
    'gambit gaming fan',
    'godsent fan',
    'guardian 2',
    'guardian elite',
    'guardian',
    'hellraisers fan',
    'ibuypower fan',
    'inferno veteran',
    'italy veteran',
    'keyd stars fan',
    'kinguin fan',
    'ldlc fan',
    'legendary lobster master',
    'lgb esports fan',
    'london consipracy fan',
    'london conspiracy fan',
    'luminosity gaming fan',
    'militia veteran',
    'mirage veteran',
    'moderator',
    'mousesports fan',
    'myxmg fan',
    'n!faculty fan',
    'natus vincere fan',
    'ninjas in pyjamas fan',
    'nuke vetera',
    'nuke veteran',
    'office veteran',
    'one bot to rule them all',
    'optic gaming fan',
    'overpass veteran',
    'penta esports fan',
    'penta sports fan',
    'phoenix',
    'planetkey dynamics fan',
    'reason gaming fan',
    'recursive fan',
    'renegades fan',
    'sk gaming fan',
    'splyce fan',
    'tactics',
    'team astralis fan',
    'team dignitas fan',
    'team ebettle fan',
    'team envyus fan',
    'team immunity fan',
    'team kinguin fan',
    'team liquid fan',
    'team solomid fan',
    'team wolf fan',
    'titan fan',
    'train veteran',
    'tsm kinguin fan',
    'universal soldiers fan',
    'valeria',
    'verygames fan',
    'vexed gaming fan',
    'victory',
    'virtus.pro fan',
    'vox eminor fan',
    'xapso fan',
];

const PAGE_LIMIT = 10;
const JSON_TAB_SIZE = 4;
const POSTS_PER_PAGE = 25;
const CONSOLE_COL_SIZE = 8;
const DONE_CHECK_INTERVAL = 100;

const users = [];
const counters = {
    existing: 0,
    pagesDone: 0,
    skipFlairs: 0,
    totalPages: 0,
};
const activeAccounts = [];

let pages = 0;

const getAccounts = function getAccounts ( game ) {
    console.log( `Loading developers for ${ game }` );
    // eslint-disable-next-line no-sync
    const gameData = JSON.parse( fs.readFileSync( path.join( __dirname, `../games/${ game }/data.json` ), 'utf8' ) );

    for ( const i in gameData.developers ) {
        if ( gameData.developers[ i ].accounts.Reddit ) {
            activeAccounts.push( gameData.developers[ i ].accounts.Reddit );
        }
    }

    console.log( `Found ${ activeAccounts.length } developers` );
};

const done = function done () {
    if ( counters.totalPages > counters.pagesDone ) {
        setTimeout( done, DONE_CHECK_INTERVAL );

        return false;
    }

    /* eslint-disable sort-keys */
    const outData = [
        {
            type: 'Total pages',
            count: counters.totalPages,
        },
        {
            type: 'Done pages',
            count: counters.pagesDone,
        },
        {
            type: 'Skipped flair',
            count: counters.skipFlairs,
        },
        {
            type: 'Existing',
            count: counters.existing,
        },
        {
            type: 'New',
            count: users.length,
        },
        {
            type: 'Total',
            count: counters.skipFlairs + counters.existing + users.length,
        },
    ];

    /* eslint-enable sort-keys */

    for ( let i = 0; i < outData.length; i = i + 1 ) {
        let padding = '\t\t';

        if ( outData[ i ].type.length >= CONSOLE_COL_SIZE ) {
            padding = '\t';
        }

        console.log( `${ outData[ i ].type }${ padding }${ outData[ i ].count }` );
    }

    if ( users.length > 0 ) {
        console.log( JSON.stringify( users, null, JSON_TAB_SIZE ) );
    }

    return true;
};

const loadPage = function loadPage ( url, callWhenDone ) {
    counters.totalPages = counters.totalPages + 1;

    const request = https.get( encodeURI( url ), ( response ) => {
        let body = '';

        response.setEncoding( 'utf8' );

        response.on( 'data', ( chunk ) => {
            body = `${ body }${ chunk }`;
        } );

        response.on( 'end', () => {
            counters.pagesDone = counters.pagesDone + 1;
            // eslint-disable-next-line prefer-reflect
            callWhenDone.call( this, body );
        } );
    } );

    request.on( 'error', ( error ) => {
        console.log( `problem with request: ${ error.message }` );
    } );
};

const isNewUser = function isNewUser ( topic ) {
    // Skip everthing that doesn't have flair
    if ( !topic.author_flair_text ) {
        return false;
    }

    // Skip everything with a flair we've setup to skip
    if ( SKIP_FLAIRS.indexOf( topic.author_flair_text.toLowerCase() ) > -1 ) {
        counters.skipFlairs = counters.skipFlairs + 1;

        return false;
    }

    // Skip everything with a user we already have
    if ( activeAccounts.indexOf( topic.author ) > -1 ) {
        counters.existing = counters.existing + 1;

        return false;
    }

    // Skip everything that we've added this run
    for ( let i = 0; i < users.length; i = i + 1 ) {
        if ( users[ i ].username === topic.author ) {
            return false;
        }
    }

    return true;
};

const getPage = function getPage ( page, after, callWhenDone ) {
    let url = `https://www.reddit.com/r/${ page }`;

    if ( after ) {
        url = `${ url }?count=${ POSTS_PER_PAGE * pages }&after=${ after }`;
    }

    console.log( `Getting page ${ pages + 1 } of ${ PAGE_LIMIT }` );

    loadPage( url, ( topicBody ) => {
        const posts = JSON.parse( topicBody );

        pages = pages + 1;
        for ( const i in posts.data.children ) {
            if ( isNewUser( posts.data.children[ i ].data ) ) {
                users.push( {
                    flair: posts.data.children[ i ].data.author_flair_text,
                    username: posts.data.children[ i ].data.author,
                } );
            }

            loadPage( `https://www.reddit.com${ posts.data.children[ i ].data.permalink }.json`, ( commentsBody ) => {
                const replies = JSON.parse( commentsBody );

                for ( const replyIndex in replies[ 1 ].data.children ) {
                    if ( isNewUser( replies[ 1 ].data.children[ replyIndex ].data ) ) {
                        users.push( {
                            flair: replies[ 1 ].data.children[ replyIndex ].data.author_flair_text,
                            username: replies[ 1 ].data.children[ replyIndex ].data.author,
                        } );
                    }
                }
            } );
        }

        if ( pages < PAGE_LIMIT ) {
            getPage( page, posts.data.after, callWhenDone );
        } else {
            // eslint-disable-next-line prefer-reflect
            callWhenDone.call( this );
        }
    } );
};

getAccounts( 'csgo' );

console.log( 'Starting with page GlobalOffensive.json' );
getPage( 'GlobalOffensive.json', false, () => {
    pages = 0;
    console.log( 'Starting with page GlobalOffensive/new.json' );

    getPage( 'GlobalOffensive/new.json', false, done );
} );
