var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductSchema = Schema({
  name: {type: String, required: true},
  sku: {type: String, required: true},
  quantity: {type: Number, required: true},
  department: {type: Schema.ObjectId, ref: 'Department', required: true},
});

// Virtual for product's URL
ProductSchema
.virtual('url')
.get(function () {
  return '/grocery/product/' + this._id;
});

//Export model
module.exports = mongoose.model('Product', ProductSchema);