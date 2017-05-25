import React from 'react';

const styles = {
    wrapper: {
        height: '600px',
        position: 'absolute',
        top: '170px',
        width: '300px',
    },
};

class Ad extends React.Component {
    constructor ( props ) {
        super( props );

        this.state = {
            styles: Object.assign( {}, styles.wrapper, props.styles || {} ),
        };
    }

    componentDidMount () {
        if ( window ) {
            ( window.adsbygoogle = window.adsbygoogle || [] ).push( {} );
        }
    }

    render () {
        return (
            <ins
                className = { 'adsbygoogle' }
                data-ad-client = { 'ca-pub-7039480870927391' }
                data-ad-slot = { this.props.dataAdSlot }
                style = { this.state.styles }
            />
        );
    }
}

Ad.displayName = 'Ad';

Ad.defaultProps = {
    styles: {},
};

Ad.propTypes = {
    dataAdSlot: React.PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    styles: React.PropTypes.object,
};

export default Ad;
