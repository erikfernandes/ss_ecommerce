const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, imageUrl, description, price, id, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this._id = id ? new mongodb.ObjectID(id) : null;
        this.userId = userId;
    }

    // Save new product to db
    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            // update product with matching id
            dbOp = db
                .collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            // insert new product
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }

    // Return all products from db
    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => console.log(err));
    }

    static findById(prodId) {
        const db = getDb();
        return db
            .collection('products')
            .find({ _id: new mongodb.ObjectId(prodId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => console.log(err));
    }

    static deleteById(prodId) {
        const db = getDb();
        return db
            .collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(result => {
                console.log('Deleted!');
            })
            .catch(err => console.log(err));
    }
}

module.exports = Product;