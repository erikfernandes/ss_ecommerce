const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(userName, email, cart, id) {
        this.userName = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
        // Check if this item already exists in user cart items array and store the index
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        // Set default item qty to 1 / copy user cart items array 
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        // If cart items array has any items, increment qty and update copied item array
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            // If cart is empty, add new item object to copied items array
            updatedCartItems.push({ 
                productId: new ObjectId(product._id), 
                quantity: newQuantity 
            });
        }

        // New cart object with updated items array 
        const updatedCart = { 
            items: updatedCartItems 
        };
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                {_id: new ObjectId(this._id)}, 
                {$set: {cart: updatedCart}}
            );
    }

    getCart() {
        const db = getDb();
 
        const productIds = [];
        const quantities = {};
    
        this.cart.items.forEach((i) => {
            productIds.push(i.productId);
            quantities[i.productId] = i.quantity;
        });
    
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then((products) => {
                return products.map((p) => {
                    return { ...p, quantity: quantities[p._id] };
                });
            });
    }

    deleteItemFromCart(productId) {
        // Filter items in user cart, return all items except item with id to be deleted
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                {_id: new ObjectId(this._id)}, 
                {$set: {cart: {items: updatedCartItems}}}
            );
    }

    addOrder() {
        const db = getDb();
        // Get array of cart products, create order with that data
        return this
            .getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        name: this.userName,
                    }
                };
                // Insert order into orders collection
                return db
                .collection('orders')
                .insertOne(order);
            })
            // clear existing cart after successfullt creating order, update user collection
            .then(result => {
                this.cart = { items: [] };
                return db
                    .collection('users')
                    .updateOne(
                        { _id: new ObjectId(this._id) }, 
                        { $set: { cart: { items: [] } } }
                    );
            });
            
    }

    getOrders() {
        const db = getDb();
        return db
            .collection('orders')
            .find({'user._id': new ObjectId(this._id)})
            .toArray();
    }

    static findById(userID) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: new ObjectId(userID) })
            .then(user => {
                console.log(user);
                return user;
            })
            .catch(err => console.log(err));
    }
}

module.exports = User;