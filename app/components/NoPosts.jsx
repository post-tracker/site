import React from 'react';

const styles = {
    wrapper: {
        textAlign: 'center',
    },
};

class NoPosts extends React.Component {
    render () {
        if ( !this.props.show ) {
            return null;
        }

        return (
            <div
                style = { styles.wrapper }
            >
                { `Sorry, no posts matching ${ this.props.query }` }
            </div>
        );
    }
}

export default NoPosts;
