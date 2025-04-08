var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/role');
let { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

/* GET roles listing. */
router.get('/', async function(req, res, next) {
    try {
        let roles = await roleSchema.find();
        res.status(200).send({
            success: true,
            data: roles
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

/* GET role by ID */
router.get('/:id', async function(req, res, next) {
    try {
      let id = req.params.id;
      let role = await roleSchema.findById(id);
      if (!role) {
        return res.status(404).send({
          success: false,
          message: "Role not found"
        });
      }
      res.status(200).send({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

/* POST create a new role */
router.post('/',check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res, next) {
    try {
      let body = req.body;
      let newRole = new roleSchema({
        name: body.name,
        description: body.description || ""
      });
      await newRole.save();
      res.status(201).send({
        success: true,
        data: newRole
      });
    } catch (error) {
      res.status(400).send({
        success: false,
        message: error.message
      });
    }
  });
  
  /* DELETE role */
  router.delete('/:id',check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res, next) {
    try {
        let id = req.params.id;
        let role = await roleSchema.findById(id);
        if(role){
            role.isDeleted = true;
            await role.save();
            res.status(200).send({
              success:true,
              data:role
            });
        }else{
          res.status(404).send({
            success:false,
            message:"ID khong ton tai"
          });
        }
      } catch (error) {
        res.status(404).send({
          success:false,
          message:error.message
        });
      }
  });

module.exports = router;
