import React from 'react';

const styles = {
    wrapper: {
        textAlign: 'center',
    },
};

class NoPosts extends React.Component {
    render () {
        return (
            <div
                style = { styles.wrapper }
            >
                { 'Sorry, that search didn\'t return any posts' }
            </div>
        );
    }
}

export default NoPosts;
