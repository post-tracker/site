import React from 'react';

import GroupCheckbox from './GroupCheckbox.jsx';

class GroupList extends React.Component {
    constructor ( props ) {
        super( props );

        this.handleFilterExpandClick = this.handleFilterExpandClick.bind( this );

        this.state = {
            showGroups: true,
        };
    }

    componentWillMount () {
        if ( window.matchMedia && window.matchMedia( '( max-width: 450px )' ).matches ) {
            this.setState( {
                showGroups: false,
            } );
        }
    }

    handleFilterExpandClick () {
        this.setState( {
            showGroups: !this.state.showGroups,
        } );
    }

    render () {
        let groupsClasses = 'groups-wrapper';
        let allChecked = true;

        const groupNodes = this.props.groups.map( ( group ) => {
            if ( group.active ) {
                allChecked = false;
            }

            return (
                <GroupCheckbox
                    checked = { group.active }
                    key = { group.name }
                    name = { group.name }
                />
            );
        } );

        if ( groupNodes.length > 1 ) {
            groupNodes.push( (
                <GroupCheckbox
                    checked = { allChecked }
                    key = { 'all' }
                    name = { 'All' }
                />
            ) );
        } else {
            groupsClasses = `${ groupsClasses } hidden`;
        }

        if ( this.state.showGroups ) {
            groupsClasses = `${ groupsClasses } show`;
        }

        return (
            <div
                className = { groupsClasses }
            >
                <div
                    className = { 'filters-wrapper' }
                    onClick = { this.handleFilterExpandClick }
                    style = { {
                        textAlign: 'right',
                    } }
                >
                    { 'Filters' }
                    <i
                        className = { 'fa fa-caret-down' }
                        style = { {
                            marginLeft: '10px',
                        } }
                    />
                </div>
                { groupNodes }
            </div>
        );
    }
}

GroupList.displayName = 'GroupList';

GroupList.propTypes = {
    // eslint-disable-next-line
    groups: React.PropTypes.array.isRequired,
};

export default GroupList;
