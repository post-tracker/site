import React from 'react';
import PropTypes from 'prop-types';

import ServiceCheckbox from './ServiceCheckbox.jsx';

class ServicesList extends React.Component {
    constructor ( props ) {
        super( props );

        this.handleFilterExpandClick = this.handleFilterExpandClick.bind( this );

        this.state = {
            showServices: true,
        };
    }

    componentWillMount () {
        if ( window.matchMedia && window.matchMedia( '( max-width: 450px )' ).matches ) {
            this.setState( {
                showServices: false,
            } );
        }
    }

    handleFilterExpandClick () {
        this.setState( {
            showServices: !this.state.showServices,
        } );
    }

    render () {
        let servicesClasses = 'services-wrapper';

        const serviceNodes = this.props.services.map( ( service ) => {
            return (
                <ServiceCheckbox
                    checked = { service.active }
                    key = { service.name }
                    name = { service.name }
                    label = { service.label }
                />
            );
        } );

        if ( serviceNodes.length < 1 ) {
            servicesClasses = `${ servicesClasses } hidden`;
        }

        if ( this.state.showServices ) {
            servicesClasses = `${ servicesClasses } show`;
        }

        return (
            <div
                className = { servicesClasses }
            >
                { serviceNodes }
            </div>
        );
    }
}

ServicesList.displayName = 'ServicesList';

ServicesList.propTypes = {
    // eslint-disable-next-line
    services: PropTypes.array.isRequired,
};

export default ServicesList;
