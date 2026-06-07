import React from 'react';
import PropTypes from 'prop-types';

// How many placeholder posts to show while the real ones load, and the line
// widths used inside each one to mimic a post body.
const PANEL_COUNT = 6;
const BODY_LINES = [ '94%', '88%', '62%' ];
const DELAY_STEPS = 4;

// Injected once (by the parent below). Bars use currentColor so they pick up the
// active theme's text color, and the panels reuse Bootstrap's .panel styling so
// the placeholders sit on the same themed background as real posts.
const skeletonCSS = `
@keyframes skeleton-pulse {
    0%, 100% { opacity: 0.09; }
    50% { opacity: 0.2; }
}
.skeleton-line {
    display: block;
    height: 12px;
    margin: 9px 0;
    border-radius: 3px;
    background-color: currentColor;
    opacity: 0.12;
    animation: skeleton-pulse 1.4s ease-in-out infinite;
}
`;

const SkeletonPost = ( { index } ) => {
    // Stagger the pulse slightly per panel so it reads as a gentle wave.
    const animationDelay = `${ ( index % DELAY_STEPS ) * 0.12 }s`;

    return (
        <div
            className = { 'panel panel-default' }
            aria-hidden = { 'true' }
        >
            <div className = { 'panel-heading' }>
                <span
                    className = { 'skeleton-line' }
                    style = { { width: '32%', height: 18, animationDelay } }
                />
            </div>
            <div className = { 'panel-body' }>
                { BODY_LINES.map( ( width, lineIndex ) => {
                    return (
                        <span
                            key = { lineIndex }
                            className = { 'skeleton-line' }
                            style = { { width, animationDelay } }
                        />
                    );
                } ) }
            </div>
            <div className = { 'panel-footer' }>
                <span
                    className = { 'skeleton-line' }
                    style = { { width: 90, height: 14, margin: 0, animationDelay } }
                />
            </div>
        </div>
    );
};

SkeletonPost.propTypes = {
    index: PropTypes.number.isRequired,
};

class Skeleton extends React.Component {
    render () {
        const panels = [];

        for ( let i = 0; i < PANEL_COUNT; i = i + 1 ) {
            panels.push(
                <SkeletonPost
                    key = { i }
                    index = { i }
                />
            );
        }

        return (
            <div
                role = { 'status' }
                aria-label = { 'Loading posts' }
            >
                <style>{ skeletonCSS }</style>
                { panels }
            </div>
        );
    }
}

export default Skeleton;
