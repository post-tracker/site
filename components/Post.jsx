import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'react-timeago';

class Post extends React.Component {
    constructor( props ){
        super( props );

        this.state = {
            expandable: false
        };
    }

    expand(){
        this.setState({
            expandable: false
        });
    }

    componentDidMount(){
        var height = ReactDOM.findDOMNode( this.refs.body ).offsetHeight;

        if( height > 500 ){
            this.setState({
                expandable: true
            });
        }
    }

    render() {
        var iconClass = 'fa fa-' + this.props.data.source;
        var expander;
        var bodyClasses = 'panel-body';o

        if( this.state.expandable ){
            expander = <div className="expander" onClick={this.expand}><button className="btn btn-default">Show full post</button></div>;
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
                            <TimeAgo
                                date = { Number( this.props.data.timestamp ) * 1000 }
                            />
                        </a>
                </div>
            </div>
        );
    }
};

export default Post;
