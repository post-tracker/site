/* eslint-disable max-len */

const sqlite3 = require( 'sqlite3' ).verbose();

class DatabaseSetup {
    constructor ( path ) {
        this.database = new sqlite3.Database( path );
    }

    setDevelopers ( developers ) {
        this.developers = developers;
    }

    run () {
        this.createTables();
        this.cleanupData();
        this.setupData();
    }

    cleanupData () {
        this.database.serialize();
        this.database.run( 'DELETE FROM developers WHERE nick IS NULL' );
        this.database.run( 'DELETE FROM accounts WHERE NOT EXISTS ( SELECT id FROM developers WHERE accounts.uid = developers.id )' );
        this.database.run( 'DELETE FROM posts WHERE NOT EXISTS ( SELECT id FROM developers WHERE posts.uid = developers.id )' );
        this.database.parallelize();
    }

    createTables () {
        this.database.serialize();
        this.database.run( 'CREATE TABLE IF NOT EXISTS posts( `topic` TEXT, `topic_url` TEXT, `uid` TEXT, `url` TEXT, `source` TEXT, `content` TEXT, `timestamp` TEXT )' );
        this.database.run( 'CREATE TABLE IF NOT EXISTS developers( `id` INT PRIMARY KEY, `nick` TEXT, `name` TEXT, `role` TEXT, `active` INT, `group` TEXT )' );
        this.database.run( 'CREATE TABLE IF NOT EXISTS accounts( `uid` INT, `service` TEXT, `identifier` TEXT )' );
        this.database.parallelize();
    }

    setupData () {
        let currentMaxUID = 0;

        const developerExistsStatement = this.database.prepare( 'SELECT `id` FROM `developers` WHERE `nick` = $nick LIMIT 1' );
        const createDeveloperStatement = this.database.prepare( 'INSERT INTO `developers` ( `id`, `nick`, `name`, `role`, `active`, `group` ) VALUES( $id, $nick, $name, $role, $active, $group )' );
        const updateDeveloperStatement = this.database.prepare( 'UPDATE `developers` SET `name` = $name, `role` = $role, `active` = $active, `group` = $group WHERE id = $id' );

        const accountExistsStatement = this.database.prepare( 'SELECT COUNT(*) AS accountCount FROM `accounts` WHERE `service` = $service AND `uid` = $uid LIMIT 1' );
        const createAccountStatement = this.database.prepare( 'INSERT INTO `accounts` ( `uid`, `service`, `identifier` ) VALUES( $uid, $service, $identifier)' );
        const updateAccountStatement = this.database.prepare( 'UPDATE `accounts` SET `identifier` = $identifier WHERE `uid` = $uid AND `service` = $service' );

        this.database.get( 'SELECT `id` FROM `developers` ORDER BY `id` DESC LIMIT 1', ( error, highestUID ) => {
            if ( error ) {
                throw error;
            }

            if ( typeof highestUID !== 'undefined' ) {
                currentMaxUID = highestUID.id;
            }

            for ( let i = 0; i < this.developers.length; i = i + 1 ) {
                if( this.developers[ i ].nick.length <= 0 ){
                    continue;
                }

                developerExistsStatement.get( {
                    $nick: this.developers[ i ].nick,
                // eslint-disable-next-line no-loop-func
                }, ( developerExistsError, developerRow ) => {
                    if ( developerExistsError ) {
                        throw developerExistsError;
                    }

                    let developerStatement = updateDeveloperStatement;
                    const bindValues = {
                        $active: this.developers[ i ].active,
                        $group: this.developers[ i ].group,
                        $name: this.developers[ i ].name,
                        $role: this.developers[ i ].role,
                    };
                    let developerUID;

                    if ( typeof developerRow === 'undefined' ) {
                        developerStatement = createDeveloperStatement;
                        currentMaxUID = currentMaxUID + 1;
                        developerUID = currentMaxUID;
                        bindValues.$nick = this.developers[ i ].nick;
                    } else {
                        developerUID = developerRow.id;
                    }

                    bindValues.$id = developerUID;

                    developerStatement.run( bindValues, ( developerError ) => {
                        if ( developerError ) {
                            throw developerError;
                        }

                        for ( const service in this.developers[ i ].accounts ) {
                            if ( !Reflect.apply( {}.hasOwnProperty, this.developers[ i ].accounts, [ service ] ) ) {
                                continue;
                            }

                            accountExistsStatement.get( {
                                $service: service,
                                $uid: developerUID,
                            }, ( accountExistsError, row ) => {
                                if ( accountExistsError ) {
                                    throw accountExistsError;
                                }

                                let accountStatement = updateAccountStatement;
                                const accountValues = {
                                    $identifier: this.developers[ i ].accounts[ service ],
                                    $service: service,
                                    $uid: developerUID,
                                };

                                if ( row.accountCount === 0 ) {
                                    accountStatement = createAccountStatement;
                                }

                                accountStatement.run( accountValues );
                            } );
                        }
                    } );
                } );
            }
        } );
    }
}

module.exports = DatabaseSetup;
