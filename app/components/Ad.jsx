import React from 'react';
import PropTypes from 'prop-types';

const styles = {
    // The positioned/sized rail is the wrapping #left-ad / #right-ad div in
    // index.html; the ins just fills it and lets AdSense pick a responsive size.
    wrapper: {
        display: 'block',
        width: '100%',
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
                data-ad-format = { 'auto' }
                data-ad-slot = { this.props.dataAdSlot }
                data-full-width-responsive = { 'true' }
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
    dataAdSlot: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.object,
};

export default Ad;
