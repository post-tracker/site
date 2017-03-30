import React from 'react';
import { connect } from 'react-redux';

import {
    getGroups,
} from '../actions';

import GroupList from '../components/GroupList.jsx';

class GroupsContainer extends React.Component {
    componentDidMount () {
        this.props.getGroups();
    }

    render () {
        return (
            <GroupList
                groups = { this.props.groups }
            />
        );
    }
}

const mapStateToProps = function mapStateToProps ( state ) {
    const {
        groups,
    } = state;

    return {
        groups: groups.items || [],
    };
};

const mapDispatchToProps = ( dispatch ) => {
    return {
        getGroups: () => {
            dispatch( getGroups() );
        },
    };
};

GroupsContainer.propTypes = {
    getGroups: React.PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    groups: React.PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( GroupsContainer );
