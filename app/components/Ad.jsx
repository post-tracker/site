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

        this.state = {};

        this.state.styles = Object.assign( {}, styles.wrapper, props.styles || {} );
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

Ad.propTypes = {
    dataAdSlot: React.PropTypes.string.isRequired,
};

export default Ad;
