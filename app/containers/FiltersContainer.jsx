import React from 'react';
import { connect } from 'react-redux';

import {
    getGroups,
    getServices,
} from '../actions';

import ServicesList from '../components/ServicesList.jsx';
import Search from './Search.jsx';
import GroupList from '../components/GroupList.jsx';

class FiltersContainer extends React.Component {
    componentDidMount () {
        this.props.getServices();
        this.props.getGroups();
    }

    render () {
        return (
            <div>
                <ServicesList
                    services = { this.props.services }
                />
                <Search />
                <GroupList
                    groups = { this.props.groups }
                />
            </div>
        );
    }
}

const mapStateToProps = function mapStateToProps ( state ) {
    const {
        groups,
        services,
    } = state;

    return {
        groups: groups.items || [],
        services: services.items || [],
    };
};

const mapDispatchToProps = ( dispatch ) => {
    return {
        getGroups: () => {
            dispatch( getGroups() );
        },
        getServices: () => {
            dispatch( getServices() );
        },
    };
};

FiltersContainer.propTypes = {
    getGroups: React.PropTypes.func.isRequired,
    getServices: React.PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    groups: React.PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    services: React.PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( FiltersContainer );
