'use strict';

var React = require( 'react' );
var SmartTimeAgo = require( 'react-smart-time-ago' );

module.exports = React.createClass({
    getInitialState: function() {
        return {
            expandable: false
        };
    },
    expand: function(){
        this.setState({
            expandable: false
        });
    },
    componentDidMount: function(){
        var height = React.findDOMNode( this.refs.body ).offsetHeight;

        if( height > 500 ){
            this.setState({
                expandable: true
            });
        }
    },
    render: function() {
        var date = new Date( this.props.data.timestamp * 1000 );
        var iconClass = 'fa fa-' + this.props.data.source;
        var expander;
        var bodyClasses = 'panel-body';

        if( this.state.expandable ){
            expander = <div className="expander" onClick={this.expand}>Show full post</div>;
            bodyClasses = bodyClasses + ' expandable';
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.data.nick} {this.props.data.role ? '[' + this.props.data.role + ']' : ''} posted in <a href={this.props.data.topic_url} dangerouslySetInnerHTML={{ __html: this.props.data.topic }}></a>
                </div>
                <div className={bodyClasses} ref="body" dangerouslySetInnerHTML={{ __html: this.props.data.content }}></div>
                {expander}
                <div className="panel-footer">
                    <i className={iconClass}></i>
                    <a href={this.props.data.url}>
                        <SmartTimeAgo value={date} />
                    </a>
                </div>
            </div>
        );
    }
});
