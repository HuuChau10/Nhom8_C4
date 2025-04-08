var express = require("express");
var router = express.Router();
let categorySchema = require("../schemas/category");
let productSchema = require("../schemas/product");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Get products by category slug
router.get("/api/:categoryslug", async function (req, res, next) {
  try {
    let categoryslug = req.params.categoryslug;
    let category = await categorySchema.findOne({ 
      slug: categoryslug,
      isDeleted: false 
    });
    
    if (category) {
      let products = await productSchema.find({ 
        category: category._id,
        isDeleted: false 
      }).populate('category', 'name slug');
      
      res.status(200).send({
        success: true,
        category: {
          name: category.name,
          slug: category.slug
        },
        data: products,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get specific product by category slug and product slug
router.get("/api/:categoryslug/:productslug", async function (req, res, next) {
  try {
    let categoryslug = req.params.categoryslug;
    let productslug = req.params.productslug;

    let category = await categorySchema.findOne({ 
      slug: categoryslug,
      isDeleted: false 
    });
    
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    let product = await productSchema.findOne({
      category: category._id,
      slug: productslug,
      isDeleted: false
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
