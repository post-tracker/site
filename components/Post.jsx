'use strict';

var React = require( 'react' );
var SmartTimeAgo = require( 'react-smart-time-ago' );

module.exports = React.createClass({
    render: function() {
        var date = new Date( this.props.data.timestamp * 1000 );
        var iconClass = 'fa fa-' + this.props.data.source;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.data.user} {this.props.data.user_role ? '[' + this.props.data.user_role + ']' : ''} posted in <a href={this.props.data.topic_url} dangerouslySetInnerHTML={{ __html: this.props.data.topic }}></a>
                </div>
                <div className="panel-body" dangerouslySetInnerHTML={{ __html: this.props.data.content }}></div>
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
