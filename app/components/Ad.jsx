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

        this.insRef = React.createRef();

        this.state = {
            styles: Object.assign( {}, styles.wrapper, props.styles || {} ),
        };
    }

    componentDidMount () {
        // adsbygoogle throws "No slot size for availableWidth=0" if we push
        // while the unit has zero width — e.g. the side rails, whose container
        // collapses on mobile, or the footer while it's hidden on desktop. Only
        // push once the unit actually has a width on screen.
        if ( window && this.insRef.current && this.insRef.current.offsetWidth > 0 ) {
            ( window.adsbygoogle = window.adsbygoogle || [] ).push( {} );
        }
    }

    render () {
        const insProps = {
            className: 'adsbygoogle',
            'data-ad-client': 'ca-pub-7039480870927391',
            'data-ad-slot': this.props.dataAdSlot,
            ref: this.insRef,
            style: this.state.styles,
        };

        // With a format set, the unit is responsive and sizes itself to the
        // container. With no format, it renders at the exact width/height in
        // `styles` — used for the small fixed footer banner so it stays a thin
        // line instead of a tall full-width-responsive block.
        if ( this.props.dataAdFormat ) {
            insProps[ 'data-ad-format' ] = this.props.dataAdFormat;
            insProps[ 'data-full-width-responsive' ] = 'true';
        }

        return (
            <ins { ...insProps } />
        );
    }
}

Ad.displayName = 'Ad';

Ad.defaultProps = {
    dataAdFormat: 'auto',
    styles: {},
};

Ad.propTypes = {
    dataAdFormat: PropTypes.string,
    dataAdSlot: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.object,
};

export default Ad;
