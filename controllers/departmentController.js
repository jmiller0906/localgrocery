var Product = require('../models/product');
var Department = require('../models/department');

var async = require('async');

// Display list of all Departments
exports.department_list = function(req, res, next) {

  Department.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_departments) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('department_list', { title: 'Department List', department_list: list_departments });
    });

};

// Display detail page for a specific Department
exports.department_detail = function(req, res, next) {

  async.parallel({
    department: function(callback) {  
      Department.findById(req.params.id)
        .exec(callback);
    },
        
    department_products: function(callback) {            
      Product.find({ 'department': req.params.id })
      .exec(callback);
    },

  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('department_detail', { title: 'Department Detail', department: results.department, department_products: results.department_products } );
  });

};

// Display Departments create form on GET
exports.department_create_get = function(req, res, next) {
    res.render('department_form', { title: 'Create Department' });
};

// Handle Department create on POST 
exports.department_create_post = function(req, res, next) {
    
    //Check that the name field is not empty
    req.checkBody('name', 'Department name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    //Run the validators
    var errors = req.validationErrors();

    //Create a department object with escaped and trimmed data.
    var department = new Department(
      { name: req.body.name }
    );
    
    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('department_form', { title: 'Create Department', department: department, errors: errors});
    return;
    } 
    else {
        // Data from form is valid.
        //Check if Department with same name already exists
        Department.findOne({ 'name': req.body.name })
            .exec( function(err, found_department) {
                 if (err) { return next(err); }
                 
                 if (found_department) { 
                     //Department exists, redirect to its detail page
                     res.redirect(found_department.url);
                 }
                 else {
                     
                     department.save(function (err) {
                       if (err) { return next(err); }
                       //Department saved. Redirect to department detail page
                       res.redirect(department.url);
                     });
                     
                 }
                 
             });
    }

};

// Display Department delete form on GET
exports.department_delete_get = function(req, res, next) {       

    async.parallel({
        department: function(callback) {     
            Department.findById(req.params.id).exec(callback);
        },
        departments_products: function(callback) {
          Product.find({ 'department': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('department_delete', { title: 'Delete Department', department: results.department, department_products: results.departments_products } );
    });
    
};

// Handle Department delete on POST 
exports.department_delete_post = function(req, res, next) {

    req.checkBody('departmentid', 'Department id must exist').notEmpty();  
    
    async.parallel({
        department: function(callback) {     
            Department.findById(req.body.departmentid).exec(callback);
        },
        departments_products: function(callback) {
          Product.find({ 'department': req.body.departmentid },'name quantity').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.departments_products.length > 0) {
            //Department has products. Render in same way as for GET route.
            res.render('department_delete', { title: 'Delete Department', department: results.department, department_products: results.departments_products } );
            return;
        }
        else {
            //Department has no products. Delete object and redirect to the list of departments.
            Department.findByIdAndRemove(req.body.departmentid, function deleteDepartment(err) {
                if (err) { return next(err); }
                //Success - got to department list
                res.redirect('/grocery/departments');
            });

        }
    });

};

var debug = require('debug')('department');

// Display department update form on GET
exports.department_update_get = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get department for form
    async.parallel({
        department: function(callback) {
            Department.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { 
			debug('update error:' + err);
			return next(err); }
            
        res.render('department_form', { title: 'Update Department', department: results.department });
    });
    
};

// Handle department update on POST 
exports.department_update_post = function(req, res, next) {
    
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('name', 'Name must not be empty.').notEmpty();
    
    req.sanitize('name').escape();
    
    var department = new Department(
      { name: req.body.name, 
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render department with error information
            res.render('department_form', { title: 'Update Department',department: department, errors: errors });

    }
    else {
        // Data from form is valid. Update the record.
        Department.findByIdAndUpdate(req.params.id, department, {}, function (err,thedepartment) {
            if (err) { return next(err); }
            //successful - redirect to department detail page.
            res.redirect(thedepartment.url);
        });
    }

};