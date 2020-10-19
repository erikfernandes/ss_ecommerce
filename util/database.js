const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

let _db;

// Connect to mongo db and store active connection 
const mongoConnect = (cb) => {
    mongoClient.connect('mongodb+srv://erik:zADMolQHeaLwcjlY@cluster0.xvm3h.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
        console.log('connected!');
        _db = client.db();
        cb();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

// returns access to connected db if it exists
const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
