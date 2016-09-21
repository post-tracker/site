const sqlite3 = require( 'sqlite3' ).verbose();

class DatabaseSetup {
    constructor( path ){
        this.database = new sqlite3.Database( path );
    }

    setDevelopers( developers ){
        this.developers = developers;
    }

    run(){
        this.createTables();
        this.setupData();
    }

    createTables(){
        this.database.serialize();
        this.database.run( 'CREATE TABLE IF NOT EXISTS posts( topic TEXT, topic_url TEXT, uid TEXT, url TEXT, source TEXT, content TEXT, timestamp TEXT )' );
        this.database.run( 'CREATE TABLE IF NOT EXISTS developers( id INT PRIMARY KEY, nick TEXT, name TEXT, role TEXT, active INT )' );
        this.database.run( 'CREATE TABLE IF NOT EXISTS accounts( uid INT, service TEXT, identifier TEXT )' );
        this.database.parallelize();
    }

    setupData(){
        let currentMaxUID = 0;

        let developerExistsStatement = this.database.prepare( 'SELECT id FROM developers WHERE nick = $nick LIMIT 1' );
        let createDeveloperStatement = this.database.prepare( 'INSERT INTO developers ( id, nick, name, role, active ) VALUES( $id, $nick, $name, $role, $active )' );
        let updateDeveloperStatement = this.database.prepare( 'UPDATE developers SET name = $name, role = $role, active = $active WHERE id = $id' );

        let accountExistsStatement = this.database.prepare( 'SELECT COUNT(*) AS accountCount FROM accounts WHERE service = $service AND uid = $uid LIMIT 1' );
        let createAccountStatement = this.database.prepare( 'INSERT INTO accounts ( uid, service, identifier ) VALUES( $uid, $service, $identifier)' );
        let updateAccountStatement = this.database.prepare( 'UPDATE accounts SET identifier = $identifier WHERE uid = $uid AND service = $service' );
            if( error ){
                throw error;
            }

        this.database.get( 'SELECT id FROM developers ORDER BY id DESC LIMIT 1', ( error, highestUID ) => {
            if ( typeof highestUID !== 'undefined' ){
                currentMaxUID = highestUID.id;
            }

            for ( let i = 0; i < this.developers.length; i = i + 1 ){
                developerExistsStatement.get( { $nick: this.developers[ i ].nick }, ( error, row ) => {
                    if( error ){
                        throw error;
                    }

                    let developerStatement = updateDeveloperStatement;
                    let bindValues = {
                        $name: this.developers[ i ].name,
                        $role: this.developers[ i ].role,
                        $active: this.developers[ i ].active
                    }
                    let developerUID;

                    if ( typeof row === 'undefined' ){
                        developerStatement = createDeveloperStatement;
                        currentMaxUID = currentMaxUID + 1;
                        developerUID = currentMaxUID;
                        bindValues.$nick = this.developers[ i ].nick;
                    } else {
                        developerUID = row.id;
                    }

                    bindValues.$id = developerUID;

                    developerStatement.run( bindValues, ( error ) => {
                        if ( error ){
                            throw error;
                        }

                        for ( let service in this.developers[ i ].accounts ){
                            if ( !this.developers[ i ].accounts.hasOwnProperty( service ) ){
                                continue;
                            }

                            accountExistsStatement.get( { $uid: developerUID, $service: service }, ( error, row ) => {
                                if ( error ){
                                    throw error;
                                }

                                let accountStatement = updateAccountStatement;
                                let accountValues = {
                                    $service: service,
                                    $identifier: this.developers[ i ].accounts[ service ],
                                    $uid: developerUID
                                };

                                if ( row.accountCount === 0 ){
                                    accountStatement = createAccountStatement;
                                }

                                accountStatement.run( accountValues );
                            } );

                        };
                    } );
                } );
            }
        } );
    }
}

module.exports = DatabaseSetup;
