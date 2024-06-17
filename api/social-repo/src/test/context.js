const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');
const pool = require('../pool');

const DEFAULT_OPTIONS = {
    host: 'localhost',
    port: 5432,
    database: 'socialnetwork-test',
    user: 'shivam.pansy',
    password: ''
}

class Context{
    static async build() {
        //generate a random role name to connect to PG as that role
        const roleName = 'a' + randomBytes(4).toString('hex');

        //connect to PG
        await pool.connect(DEFAULT_OPTIONS);

        //create a new role
        // await pool.query(`
        //     create role ${roleName} with Login password '${roleName}';
        // `);
        await pool.query(format(
            'create role %I with login password %L;', roleName, roleName
        ));

        //create a schema
        // await pool.query(`
        //     create schema ${roleName} authorization ${roleName};
        // `);
        await pool.query(format(
            'create schema %I authorization %I;', roleName, roleName
        ));

        //disconnect from PG
        await pool.close();

        //run migrations in the new schema
        await migrate({
            schema: roleName,
            direction: 'up',
            log: () => {},
            noLock: true,
            dir: 'migrations',
            databaseUrl: {
                host: 'localhost',
                port: 5432,
                database: 'socialnetwork-test',
                user: roleName,
                password: roleName
            }

        });

        //connect to PG with new role
        await pool.connect({
            host: 'localhost',
            port: 5432,
            database: 'socialnetwork-test',
            user: roleName,
            password: roleName
        });
        
        return new Context(roleName);
    }


    constructor(roleName){
        this.roleName = roleName;
    }

    async reset(){
        return pool.query(`
            delete from users;
        `)
    }

    async close() {
        //disconnect from pg
        await pool.close();

        //connect to PG as usual
        await pool.connect(DEFAULT_OPTIONS);

        //delete the role and schema
        await pool.query(
            format('DROP schema %I cascade;', this .roleName)
        );

        await pool.query(
            format('DROP role %I;', this .roleName)
        );

        await pool.close();
    }
}

module.exports = Context;