var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DepartmentSchema = Schema(
  {
    name: {type: String, required: true, max: 100},
  }
);

// Virtual for department's URL
DepartmentSchema
.virtual('url')
.get(function () {
  return '/grocery/department/' + this._id;
});

//Export model
module.exports = mongoose.model('Department', DepartmentSchema);