const pg = require('pg');

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'socialnetwork',
    user: 'shivam.pansy',
    password: ''
});

pool.query(`
    update posts 
    set loc = POINT(lat, lng)
    where loc is NULL;
`)
.then(() => {
    console.log('Update complete');
    pool.end();
})
.catch((err) => {
    console.log(err.message);
});
