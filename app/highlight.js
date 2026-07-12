// Search phrase highlighting for the post feed (issue #45).
//
// Post bodies and topics are raw developer HTML injected via
// dangerouslySetInnerHTML, so we can't naively string-replace the search term
// into them — that would corrupt tag names and attribute values (e.g. a search
// for "img" or "class" would rewrite the markup). Instead we tokenise the HTML
// into tags vs. text runs and only wrap matches that fall inside text runs.

const MIN_TERM_LENGTH = 2;

const escapeRegExp = function escapeRegExp ( string ) {
    return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
};

// Build a single case-insensitive regex that matches any of the search terms.
// The full phrase is matched first (longest-first alternation) so a multi-word
// query highlights the whole phrase when it appears contiguously, then falls
// back to the individual words elsewhere.
const buildTermRegex = function buildTermRegex ( search ) {
    if ( typeof search !== 'string' ) {
        return false;
    }

    const phrase = search.trim();

    if ( phrase.length < MIN_TERM_LENGTH ) {
        return false;
    }

    const words = phrase
        .split( /\s+/ )
        .filter( ( word ) => {
            return word.length >= MIN_TERM_LENGTH;
        } );

    // De-dupe while keeping the full phrase (if multi-word) at the front so the
    // alternation prefers the longest match.
    const terms = [];

    if ( words.length > 1 ) {
        terms.push( phrase );
    }

    words.forEach( ( word ) => {
        if ( terms.indexOf( word ) === -1 ) {
            terms.push( word );
        }
    } );

    if ( terms.length < 1 ) {
        return false;
    }

    const pattern = terms
        .map( escapeRegExp )
        .join( '|' );

    return new RegExp( `(${ pattern })`, 'gi' );
};

// Wrap search matches in <mark class="search-highlight"> within the text runs
// of an HTML string, leaving tags and attributes untouched.
const highlightHtml = function highlightHtml ( htmlString, search ) {
    const termRegex = buildTermRegex( search );

    if ( !termRegex || typeof htmlString !== 'string' || htmlString.length < 1 ) {
        return htmlString;
    }

    // Split into tags ("<...>") and the text between them. Every other token is
    // a tag; the text tokens are safe to rewrite.
    return htmlString
        .split( /(<[^>]+>)/ )
        .map( ( token ) => {
            if ( token.length < 1 || token.charAt( 0 ) === '<' ) {
                return token;
            }

            return token.replace( termRegex, '<mark class="search-highlight">$1</mark>' );
        } )
        .join( '' );
};

export {
    buildTermRegex,
    highlightHtml,
};
