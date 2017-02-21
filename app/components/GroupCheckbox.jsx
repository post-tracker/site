import React from 'react';

import { connect } from 'react-redux';

import {
    toggleGroup,
} from '../actions';

class GroupCheckbox extends React.Component {
    getParsedGroupName () {
        return this.props.name
            .toLowerCase()
            .replace( /\s/gim, '-' )
            .replace( /[^a-z0-9-]/gim, '' );
    }

    render () {
        return (
            <div
                className = { 'checkbox' }
            >
                <label>
                    <input
                        checked = { this.props.checked }
                        name = { this.props.name }
                        onChange = { this.props.handleCheckboxChange }
                        type = { 'checkbox' }
                    />
                    <span
                        className = { `group-label ${ this.getParsedGroupName() }` }
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
            dispatch( toggleGroup( ownProps.name ) );
        },
    };
};

GroupCheckbox.displayName = 'GroupCheckbox';

GroupCheckbox.propTypes = {
    checked: React.PropTypes.bool.isRequired,
    handleCheckboxChange: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
};

export default connect(
    null,
    mapDispatchToProps
)( GroupCheckbox );
