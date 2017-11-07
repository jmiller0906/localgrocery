var express = require('express');
var router = express.Router();

// Require controller modules
var product_controller = require('../controllers/productController');
var department_controller = require('../controllers/departmentController');

/// PRODUCT ROUTES ///

/* GET grocery home page. */
router.get('/', product_controller.index);

/* GET request for creating a Product. NOTE This must come before routes that display Product (uses id) */
router.get('/product/create', product_controller.product_create_get);

/* POST request for creating Product. */
router.post('/product/create', product_controller.product_create_post);

/* GET request to delete Product. */
router.get('/product/:id/delete', product_controller.product_delete_get);

// POST request to delete Product
router.post('/product/:id/delete', product_controller.product_delete_post);

/* GET request to update Product. */
router.get('/product/:id/update', product_controller.product_update_get);

// POST request to update Product
router.post('/product/:id/update', product_controller.product_update_post);

/* GET request for one Product. */
router.get('/product/:id', product_controller.product_detail);

/* GET request for list of all Product items. */
router.get('/products', product_controller.product_list);

/// DEPARTMENT ROUTES ///

/* GET request for creating a Department. NOTE This must come before route that displays Department (uses id) */
router.get('/department/create', department_controller.department_create_get);

/* POST request for creating Department. */
router.post('/department/create', department_controller.department_create_post);

/* GET request to delete Department. */
router.get('/department/:id/delete', department_controller.department_delete_get);

// POST request to delete Department
router.post('/department/:id/delete', department_controller.department_delete_post);

/* GET request to update Department. */
router.get('/department/:id/update', department_controller.department_update_get);

// POST request to update Department
router.post('/department/:id/update', department_controller.department_update_post);

/* GET request for one Department. */
router.get('/department/:id', department_controller.department_detail);

/* GET request for list of all Department. */
router.get('/departments', department_controller.department_list);

module.exports = router;