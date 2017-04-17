import React from 'react';

import { connect } from 'react-redux';

import {
    toggleService,
} from '../actions';

class ServiceCheckbox extends React.Component {
    getParsedServiceName () {
        return this.props.name
            .toLowerCase()
            .replace( /\s/gim, '-' )
            .replace( /[^a-z0-9-]/gim, '' );
    }

    render () {
        return (
            <div
                className = { 'checkbox service-checkbox' }
            >
                <label>
                    <input
                        checked = { this.props.checked }
                        name = { this.props.name }
                        onChange = { this.props.handleCheckboxChange }
                        type = { 'checkbox' }
                    />
                    <span
                        className = { `filter-label service-label ${ this.getParsedServiceName() }` }
                        title = { this.props.name }
                    >
                        { this.props.name }
                    </span>
                </label>
            </div>
        );
    }
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
    return {
        handleCheckboxChange: () => {
            dispatch( toggleService( ownProps.name ) );
        },
    };
};

ServiceCheckbox.displayName = 'ServiceCheckbox';

ServiceCheckbox.propTypes = {
    checked: React.PropTypes.bool.isRequired,
    handleCheckboxChange: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
};

export default connect(
    null,
    mapDispatchToProps
)( ServiceCheckbox );
