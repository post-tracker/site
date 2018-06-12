import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ServicesList from '../components/ServicesList.jsx';
import Search from './Search.jsx';
import GroupList from '../components/GroupList.jsx';

class FiltersContainer extends React.Component {
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

FiltersContainer.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    groups: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    services: PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps
)( FiltersContainer );
