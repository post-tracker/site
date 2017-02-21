import { connect } from 'react-redux';

import {
    search,
} from '../actions';

import Search from '../components/Search.jsx';

const mapStateToProps = ( state ) => {
    return {
        searchTerm: state.search,
    };
};

const mapDispatchToProps = ( dispatch ) => {
    return {
        updateSearchTerm: ( searchTerm ) => {
            dispatch( search( searchTerm ) );
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( Search );
