const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            { 
                productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, 
                quantity: { type: Number, required: true } 
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
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
            productId: product._id, 
            quantity: newQuantity 
        });
    }

    // New cart object with updated items array 
    const updatedCart = { 
        items: updatedCartItems 
    };
    this.cart = updatedCart;
    return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
    // Filter items in user cart, return all items except item with id to be deleted
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(productId) {
    this.cart = { items: [] }
    return this.save();
}

module.exports = mongoose.model('User', userSchema);