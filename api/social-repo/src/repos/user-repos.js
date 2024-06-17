const pool =  require('../pool')
const toCamelCase = require('./utils/to-camel-case');

class UserRepo {
    static async find() {
        const { rows } = await pool.query('Select * from users;');

        return toCamelCase(rows);
    }

    static async findById(id){
        //const { rows } = await pool.query(`select * from users where id = ${id}`); //SQL injection
        const { rows } = await pool.query(`select * from users where id = $1;`, [id]);
        return toCamelCase(rows)[0];
    }

    static async insert(username, bio){
        const { rows } = await pool.query(`insert into users(username, bio)values ($1, $2) returning *;`, [username, bio]);

        return toCamelCase(rows)[0];
    }

    static async update(id, username, bio){
        const { rows } = await pool.query(`update users set username = $1, bio = $2 where id = $3 returning *;`, [username, bio, id]);

        return toCamelCase(rows)[0];
    }

    static async delete(id){
        const { rows } = await pool.query(`delete from users where id = $1 returning *;`, [id]);

        return toCamelCase(rows)[0];
    }

    static async count(){
        const { rows } = await pool.query('Select count(*) from users;');
        return parseInt(rows[0].count);
    }
}


module.exports = UserRepo;