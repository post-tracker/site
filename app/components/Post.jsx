import React from 'react';
import TimeAgo from 'react-timeago';

const POST_CUTOFF_HEIGHT = 1000;
const TIMESTAMP_UPDATE_INTERVAL = 1000;

const styles = {
    permalink: {
        float: 'right',
        lineHeight: '27px',
    },
    sourceIcon: {
        height: '20px',
        marginRight: '8px',
        position: 'relative',
        top: '4px',
        width: '20px',
    },
};

class Post extends React.Component {
    constructor ( props ) {
        super( props );

        this.expand = this.expand.bind( this );
        this.handleExpandClick = this.handleExpandClick.bind( this );

        this.state = {
            expandable: false,
        };
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
            case 'LudeonForums':
                service = 'comments';
                break;
            case 'PUBGForums':
                service = 'comments';
                break;
            case 'SurviveTheArk':
                service = 'comments';
                break;
            case 'Bungie.net':
                service = 'comments';
                break;
            default:
                service = originalService;
                break;
        }

        /* eslint-enable indent */

        return service.toLowerCase();
    }

    getSectionIcon () {
        const sectionURL = this.getSectionURL();

        if ( sectionURL ) {
            return (
                <a
                    href = { sectionURL }
                >
                    <svg
                        className = { 'icon' }
                        style = { styles.sourceIcon }
                    >
                        <use
                            xlinkHref = { `#icon-${ this.state.service }` }
                        />
                    </svg>
                </a>
            );
        }

        return (
            <svg
                className = { 'icon' }
                style = { styles.sourceIcon }
            >
                <use
                    xlinkHref = { `#icon-${ this.state.service }` }
                />
            </svg>
        );
    }

    getPostLink () {
        if ( this.state.service === 'reddit' ) {
            const matches = this.props.postData.url.match( /.*\/(.+?)\/$/ );

            if ( matches && matches[ 1 ] ) {
                return `${ this.props.postData.url }?context=999#${ matches[ 1 ] }`;
            // } else if ( matches && matches[ 0 ] ) {
            //    return `${ this.props.postData.url }?context=999#${ matches[ 0 ] }`;
            } else {
                console.log( `Unable to match postId for ${ this.props.postData.url }` );
                return `${ this.props.postData.url }?context=999`;
            }
        }

        return this.props.postData.url;
    }

    render () {
        let expander;
        let bodyClasses = 'panel-body';
        let title;
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
            title = '[ ';

            if ( this.props.postData.account.developer.role ) {
                title = `${ title }${ this.props.postData.account.developer.role }`;
            }

            if ( this.props.postData.account.developer.group ) {
                // eslint-disable-next-line no-magic-numbers
                if ( title.length > 2 ) {
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

        if ( title ) {
            postedString = ` ${ title } `;
        }

        if ( this.props.postData.topicUrl ) {
            postedString = `${ postedString } posted in `;
            topicLinkNode = (
                <a
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML = { {
                        __html: this.props.postData.topic,
                    } }
                    href = { this.props.postData.topicUrl } // eslint-disable-line camelcase
                />
            );
        } else {
            postedString = `${ postedString } ${ this.props.postData.topic }`;
        }

        return (
            <div
                className = { 'panel panel-default' }
            >
                <div
                    className = { 'panel-heading' }
                >
                    <span
                        title = { this.props.postData.account.developer.name }
                    >
                        { this.props.postData.account.developer.nick }
                    </span>
                    { postedString }
                    { topicLinkNode }
                </div>
                <div
                    className = { bodyClasses }
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML = { {
                        __html: this.props.postData.content,
                    } }
                    // eslint-disable-next-line react/jsx-no-bind
                    ref = { ( node ) => {
                        this.body = node;
                    } }
                />
                { expander }
                <div
                    className = { 'panel-footer' }
                >
                    { this.getSectionIcon() }
                    <a
                        href = { this.getPostLink() }
                    >
                        <TimeAgo
                            date = { Number( this.props.postData.timestamp ) * TIMESTAMP_UPDATE_INTERVAL }
                        />
                    </a>
                    <a
                        href = { `?post=${ this.props.postData.id }` }
                        style = {
                            styles.permalink
                        }
                    >
                        { 'Direct link' }
                    </a>
                </div>
            </div>
        );
    }
}

Post.propTypes = {
    postData: React.PropTypes.shape( {
        account: React.PropTypes.shape( {
            developer: React.PropTypes.shape( {
                group: React.PropTypes.string,
                name: React.PropTypes.string,
                nick: React.PropTypes.string,
                role: React.PropTypes.string,
            } ),
            identifier: React.PropTypes.string,
            service: React.PropTypes.string,
        } ),
        content: React.PropTypes.string,
        id: React.PropTypes.string,
        section: React.PropTypes.string,
        timestamp: React.PropTypes.number,
        topic: React.PropTypes.string,
        topicUrl: React.PropTypes.string,
        url: React.PropTypes.string,
        urlHash: React.PropTypes.string,
    } ).isRequired,
};

export default Post;
