import React from 'react';
import TimeAgo from 'react-timeago';
import PropTypes from 'prop-types';

import { highlightHtml } from '../highlight';

const POST_CUTOFF_HEIGHT = 1000;
const TIMESTAMP_UPDATE_INTERVAL = 1000;

// Services whose "topic" is the platform name itself (a feed you post *on*),
// not a thread/forum/subreddit you post *in*. Drives the "posted on/in …"
// preposition in the header. Compared case-insensitively. Only list services
// whose topic is genuinely a platform label AND that carry a topicUrl (so they
// reach the "posted <prep> <topic>" branch) — e.g. Twitter's topic is the verb
// "tweeted" with no topicUrl, so it must NOT go here.
const POSTED_ON_SERVICES = [
    'bluesky',
];

const styles = {
    permalink: {
        float: 'right',
        lineHeight: '27px',
    },
    sourceIcon: {
        height: '20px',
        marginRight: '8px',
        width: '20px',
    },
    shareIcon: {
        height: '14px',
        width: '14px',
        verticalAlign: 'middle',
        marginRight: '4px',
    },
};

class Post extends React.Component {
    constructor ( props ) {
        super( props );

        this.expand = this.expand.bind( this );
        this.handleExpandClick = this.handleExpandClick.bind( this );
        this.handleShareClick = this.handleShareClick.bind( this );

        this.state = {
            expandable: false,
            // Whether the Web Share API is available (#27). Feature-detected so
            // the button is only rendered where the browser can honour it —
            // mobile browsers + desktop Chrome/Edge, not Firefox desktop.
            canShare: typeof navigator !== 'undefined' && typeof navigator.share === 'function',
        };
        this.postIndex = props.postIndex;
    }

    componentWillMount () {
        this.setState( {
            service: this.normaliseSource( this.props.postData.account.service ),
        } );
    }

    componentDidMount () {
        const height = this.body.offsetHeight;

        if ( height > POST_CUTOFF_HEIGHT ) {
            // eslint-disable-next-line  react/no-did-mount-set-state
            this.setState( {
                expandable: true,
            } );
        }
    }

    getSectionURL () {
        const url = this.props.postData.url;

        if ( url.indexOf( 'steamcommunity.com' ) > -1 ) {
            const match = url.match( /(http[s]?:\/\/steamcommunity.com\/app\/\d+\/discussions\/\d+\/).+?/ );

            if ( match && match[ 1 ] ) {
                return match[ 1 ];
            }
        } else if ( url.indexOf( 'reddit.com' ) > -1 ) {
            const match = url.match( /(https:\/\/www\.reddit\.com\/r\/.+?)\/.+?/ );

            if ( match && match[ 1 ] ) {
                return match[ 1 ];
            }
        }

        return false;
    }

    handleExpandClick () {
        this.expand();
    }

    getPermalink () {
        // The footer "Direct link" points at ?post=<id> on the current game
        // page; share that same canonical URL as an absolute address.
        const permalink = `?post=${ this.props.postData.id }`;

        if ( typeof window === 'undefined' || !window.location ) {
            return permalink;
        }

        return new URL( permalink, window.location.href ).href;
    }

    getShareTitle () {
        const dev = this.props.postData.account.developer;
        const who = ( dev && ( dev.nick || dev.name ) ) || 'A developer';
        const game = ( typeof window !== 'undefined' && window.gameName ) || 'the dev tracker';

        return `${ who } on ${ game }`;
    }

    handleShareClick ( event ) {
        event.preventDefault();

        if ( !this.state.canShare ) {
            return;
        }

        // navigator.share rejects if the user dismisses the sheet; swallow that
        // (and any other error) so it never surfaces as an unhandled rejection.
        const sharePromise = navigator.share( {
            title: this.getShareTitle(),
            url: this.getPermalink(),
        } );

        if ( sharePromise && typeof sharePromise.catch === 'function' ) {
            sharePromise.catch( () => {} );
        }
    }

    expand () {
        this.setState( {
            expandable: false,
        } );
    }

    normaliseSource ( originalService ) {
        let service;

        /* eslint-disable indent */
        switch ( originalService ) {
            case 'MiggyRSS':
            service = 'RSS';
            break;
            case 'Steam':
            case 'Reddit':
            case 'Twitter':
            service = originalService;
            break;
            default:
            service = 'comments';
            break;
        }

        /* eslint-enable indent */

        return service.toLowerCase();
    }

    getSectionIcon () {
        const sectionURL = this.getSectionURL();
        const baseIcon = (
            <svg
                className = { `icon ${this.state.service}` }
                style = { styles.sourceIcon }
            >
                <use
                    xlinkHref = { `#icon-${ this.state.service }` }
                />
            </svg>
        );

        if ( sectionURL ) {
            return (
                <a
                    className = { 'icon-a' }
                    href = { sectionURL }
                >
                    { baseIcon }
                </a>
            );
        }

        return baseIcon;
    }

    getPostLink () {
        if ( this.state.service === 'reddit' ) {
            // Fix some old urls
            // https://www.reddit.com/r/EliteDangerous/comments/3w7t0y/1_week_blind_auction/cxu11nt#cxu11nt
            // to
            // https://www.reddit.com/r/EliteDangerous/comments/3w7t0y/1_week_blind_auction/cxu11nt/
            const matches = this.props.postData.url.replace( /(.+?)\#\1/, '$1/' ).match( /.*\/(.+?)\/$/ );

            if ( matches && matches[ 1 ] ) {
                return `${ this.props.postData.url }?context=999#${ matches[ 1 ] }`;
            } else {
                console.log( `Unable to match postId for ${ this.props.postData.url }` );
                return `${ this.props.postData.url }?context=999`;
            }
        }

        return this.props.postData.url;
    }

    updateImages ( htmlString ) {
        const maxWidth = Math.min( window.innerWidth, 1140 );
        const maxHeight = Math.min( window.innerWidth, 600 );
        const imgRegex = new RegExp( '<img[^>]+?(src="(https?:)?\/\/(.+?)").*?>', 'g' );
        const srcsetRegex = new RegExp( '<img[^>]+?(srcset="(https?:)?\/\/(.+?)) (.+?)".*?>', 'g' );
        let matches;
        let loadingTypeString = ' loading="lazy" ';

        if(this.postIndex === 0){
            loadingTypeString = '';
        }

        while ( ( matches = imgRegex.exec( htmlString ) ) !== null ) {
            let fallbackUrl = matches[ 3 ];
            if ( matches[ 2 ] === 'https:' ) {
                fallbackUrl = `ssl:${ fallbackUrl }`;
            }
            // Post bodies are raw developer HTML; embedded media rarely carries
            // an alt, which fails the image-alt a11y audit. Treat them as
            // decorative with alt="" — but only when the source tag has none, so
            // a real description is never clobbered.
            const altAttr = ( /\balt\s*=/ ).test( matches[ 0 ] ) ? '' : ' alt=""';
            const newSrc = `src="https://images.weserv.nl/?url=${ encodeURIComponent( matches[ 3 ] ) }&w=${ maxWidth }&h=${ maxHeight }&t=fit&format=webp&il&errorredirect=${ encodeURIComponent( fallbackUrl ) }"${ loadingTypeString }${ altAttr }`;
            htmlString = htmlString.replace( matches[ 1 ], newSrc );
        }

        while ( ( matches = srcsetRegex.exec( htmlString ) ) !== null ) {
            let fallbackUrl = matches[ 3 ];
            if ( matches[ 2 ] === 'https:' ) {
                fallbackUrl = `ssl:${ fallbackUrl }`;
            }
            const altAttr = ( /\balt\s*=/ ).test( matches[ 0 ] ) ? '' : ' alt=""';
            const newSrc = `srcset="https://images.weserv.nl/?url=${ encodeURIComponent( matches[ 3 ] ) }&w=${ maxWidth }&h=${ maxHeight }&t=fit&format=webp&&il&errorredirect=${ encodeURIComponent( fallbackUrl ) } ${ matches[ 4 ] }"${ loadingTypeString }${ altAttr }`
            htmlString = htmlString.replace( matches[ 1 ], newSrc );
        }

        return htmlString;
    }

    updateIframes ( htmlString ) {
        const frameRegex = new RegExp( '<iframe.+?src="(https?:\/\/.+?)".+?><\/iframe>', 'g' )
        let matches;

        while ( ( matches = frameRegex.exec( htmlString ) ) !== null ) {
            let url = matches[ 1 ];

            // handle some invision power board stuff
            if ( url.substr( -9 ) === '?do=embed' ) {
                url = url.substring( 0, url.length - 9 );
            }

            const newHtml = `<a href="${ url }">${ url }</a>`;

            htmlString = htmlString.replace( matches[ 0 ], newHtml );
            frameRegex.lastIndex = 0;
        }

        return htmlString;
    }

    getContentMarkup () {
        let content = this.updateImages( this.props.postData.content );

        content = this.updateIframes( content );

        content = highlightHtml( content, this.props.searchTerm );

        return content;
    }

    render () {
        let expander;
        let bodyClasses = 'panel-body';
        let title = '';
        let postedString = '';
        let topicLinkNode = false;

        if ( this.state.expandable ) {
            expander = (
                <div
                    className = { 'expander' }
                    onClick = { this.handleExpandClick }
                >
                    <button
                        className = { 'btn btn-default' }
                    >
                        { 'Show full post' }
                    </button>
                </div>
            );

            bodyClasses = `${ bodyClasses } expandable`;
        }

        // Handle bbcode spoilers
        if ( this.props.postData.content.indexOf( 'bb-spoiler-toggle' ) > -1 ) {
            this.props.postData.content = this.props.postData.content.replace( /bb-spoiler-toggle"><button>/g, 'bb-spoiler-toggle"><button class="btn btn-default">' );
        }

        if ( this.props.postData.account.developer.role || this.props.postData.account.developer.group ) {
            title = ' [ ';

            if ( this.props.postData.account.developer.role ) {
                title = `${ title }${ this.props.postData.account.developer.role }`;
            }

            if ( this.props.postData.account.developer.group ) {
                // eslint-disable-next-line no-magic-numbers
                if ( title.length > 3 ) {
                    title = `${ title } - `;
                }

                title = `${ title }${ this.props.postData.account.developer.group }`;
            }

            title = `${ title } ]`;

            // If we have roles that are the same as the nick, don't display anything
            if ( !this.props.postData.account.developer.group && this.props.postData.account.developer.role === this.props.postData.account.developer.nick ) {
                title = '';
            } else if ( !this.props.postData.account.developer.role && this.props.postData.account.developer.group === this.props.postData.account.developer.nick ) {
                title = '';
            }
        }

        if ( this.props.postData.topicUrl ) {
            const service = String( this.props.postData.account.service || '' ).toLowerCase();
            const preposition = POSTED_ON_SERVICES.indexOf( service ) > -1 ? 'on' : 'in';

            // Historically some sources stored the topic with the phrase baked
            // in (e.g. Bluesky's "posted on Bluesky"), which rendered as
            // "posted on posted on Bluesky". We supply the "posted on/in " lead
            // ourselves, so strip any such leading phrase off the stored topic
            // to normalise both old rows and current ones to a single label.
            const topic = String( this.props.postData.topic || '' ).replace( /^\s*posted\s+(?:on|in)\s+/i, '' );

            postedString = `${ postedString } posted ${ preposition } `;
            topicLinkNode = (
                <a
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML = { {
                        __html: highlightHtml( topic, this.props.searchTerm ),
                    } }
                    href = { this.props.postData.topicUrl }
                />
            );
        } else {
            postedString = ` ${ this.props.postData.topic }`;
        }

        return (
            <div
                className = { this.props.isNew ? 'panel panel-default unread' : 'panel panel-default' }
            >
                <div
                    className = { 'panel-heading' }
                >
                    <span
                        className = { 'author' }
                        title = { this.props.postData.account.developer.name }
                    >
                        { this.props.postData.account.developer.nick }

                        { title ?
                            <span
                                className = { 'role' }
                            >
                                { title }
                            </span>
                            : ''
                        }
                    </span>
                    { this.props.isNew ?
                        <span
                            className = { 'new-badge' }
                        >
                            { 'New' }
                        </span>
                        : ''
                    }
                    { postedString }
                    { topicLinkNode }
                </div>
                <div
                    className = { bodyClasses }
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML = { {
                        __html: this.getContentMarkup(),
                    } }
                    // eslint-disable-next-line react/jsx-no-bind
                    ref = { ( node ) => {
                        this.body = node;
                    } }
                />

                <div
                    className = { 'panel-footer' }
                >
                    { expander }

                    <span
                        className = { 'timed' }
                    >
                        { this.getSectionIcon() }
                        <a
                            href = { this.getPostLink() }
                        >
                            <TimeAgo
                                date = { Number( this.props.postData.timestamp ) * TIMESTAMP_UPDATE_INTERVAL }
                            />
                        </a>
                    </span>
                    <span
                        className = { 'footer-links' }
                    >
                        { this.state.canShare ?
                            <a
                                className = { 'link share-link' }
                                href = { `?post=${ this.props.postData.id }` }
                                onClick = { this.handleShareClick }
                                title = { 'Share this post' }
                                aria-label = { 'Share this post' }
                            >
                                <svg
                                    className = { 'icon' }
                                    style = { styles.shareIcon }
                                >
                                    <use
                                        xlinkHref = { '#icon-share' }
                                    />
                                </svg>
                                { 'Share' }
                            </a>
                            : ''
                        }
                        <a
                            className = { 'link' }
                            href = { `?post=${ this.props.postData.id }` }
                        >
                            { 'Direct link' }
                        </a>
                    </span>
                </div>
            </div>
        );
    }
}

Post.propTypes = {
    postData: PropTypes.shape( {
        account: PropTypes.shape( {
            developer: PropTypes.shape( {
                group: PropTypes.string,
                name: PropTypes.string,
                nick: PropTypes.string,
                role: PropTypes.string,
            } ),
            identifier: PropTypes.string,
            service: PropTypes.string,
        } ),
        content: PropTypes.string,
        id: PropTypes.string,
        section: PropTypes.string,
        timestamp: PropTypes.number,
        topic: PropTypes.string,
        topicUrl: PropTypes.string,
        url: PropTypes.string,
        urlHash: PropTypes.string,
    } ).isRequired,
    postIndex: PropTypes.number,
    isNew: PropTypes.bool,
    searchTerm: PropTypes.string,
};

export default Post;
