var Product = require('../models/product');
var Department = require('../models/department');

var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        product_count: function(callback) {
            Product.count(callback);
        },
        department_count: function(callback) {
            Department.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Miller Grocery Home', error: err, data: results });
    });
};

// Display list of all Products
exports.product_list = function(req, res, next) {

  Product.find({}, 'name department')
    .populate('department')
    .exec(function (err, list_products) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('product_list', { title: 'Product List', product_list: list_products });
    });
    
};

// Display detail page for a specific Product
exports.product_detail = function(req, res, next) {

  async.parallel({
    product: function(callback) {  
      Product.findById(req.params.id)
        .exec(callback);
    },
        
    product_department: function(callback) {            
      Department.find({ 'product': req.params.id }, 'name')
      .exec(callback);
    },

  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('product_detail', { title: 'Product Detail', product: results.product, product_department: results.product_department } );
  });

};

// Display product create form on GET
exports.product_create_get = function(req, res, next) { 
      
    //Get all departments, which we can use for adding to our product.
    async.parallel({
        departments: function(callback) {
            Department.find(callback);
        },       
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('product_form', { title: 'Create Product', departments: results.departments });
    });
    
};

// Handle product create on POST 
exports.product_create_post = function(req, res, next) {

    req.checkBody('name', 'Name must not be empty.').notEmpty();
    req.checkBody('sku', 'SKU must not be empty').notEmpty();
    req.checkBody('quantity', 'Quantity must not be empty').notEmpty();
    
    req.sanitize('name').escape();
    req.sanitize('sku').escape();
    req.sanitize('quantity').escape();
    req.sanitize('department').escape();
    
    var product = new Product({
        name: req.body.name, 
        sku: req.body.sku, 
        quantity: req.body.quantity,
        department: req.body.department
    });
    
    var errors = req.validationErrors();
    if (errors) {
        // Some problems so we need to re-render our product

        //Get all departments for form
        async.parallel({
            departments: function(callback) {
                Department.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }

            res.render('product_form', { title: 'Create Product',departments:results.departments, product: product, errors: errors });
        });

    } 
    else {
    // Data from form is valid.
    // We could check if product exists already, but lets just save.
    
        product.save(function (err) {
            if (err) { return next(err); }
            //successful - redirect to new product record.
            res.redirect(product.url);
        });
    }

};

// Display Product delete form on GET
exports.product_delete_get = function(req, res, next) {       

    async.parallel({
        product: function(callback) {     
            Product.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('product_delete', { title: 'Delete Product', product: results.product } );
    });
    
};

// Handle Product delete on POST 
exports.product_delete_post = function(req, res, next) {

    req.checkBody('productid', 'Product id must exist').notEmpty();  
    
    async.parallel({
        product: function(callback) {     
            Product.findById(req.body.productid).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
                //Success - go to product list
                res.redirect('/grocery/products');
            });

        };

var debug = require('debug')('product');

// Display product update form on GET
exports.product_update_get = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get product and department for form
    async.parallel({
        product: function(callback) {
            Product.findById(req.params.id).populate('department').exec(callback);
        },
        departments: function(callback) {
            Department.find(callback);
        },
    }, function(err, results) {
        if (err) { 
			debug('update error:' + err);
			return next(err); }
            
        res.render('product_form', { title: 'Update Product', departments:results.departments, product: results.product });
    });
    
};

// Handle product update on POST 
exports.product_update_post = function(req, res, next) {
    
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('name', 'Name must not be empty.').notEmpty();
    req.checkBody('sku', 'SKU must not be empty').notEmpty();
    req.checkBody('quantity', 'Quantity must not be empty').notEmpty();
    req.checkBody('department', 'Department must not be empty').notEmpty();
    
    req.sanitize('name').escape();
    req.sanitize('sku').escape();
    req.sanitize('quantity').escape();
    req.sanitize('department').escape();
    
    var product = new Product(
      { name: req.body.name, 
        sku: req.body.sku, 
        quantity: req.body.quantity,
        department: req.body.department,
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render product with error information
        // Get all departments for form
        async.parallel({
            departments: function(callback) {
                Department.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            
            res.render('product_form', { title: 'Update Product',departments:results.departments, product: product, errors: errors });
        });

    } 
    else {
        // Data from form is valid. Update the record.
        Product.findByIdAndUpdate(req.params.id, product, {}, function (err,theproduct) {
            if (err) { return next(err); }
            //successful - redirect to product detail page.
            res.redirect(theproduct.url);
        });
    }

};