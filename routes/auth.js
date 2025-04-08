var express = require("express");
var router = express.Router();
let userControllers = require("../controllers/users");
let { check_authentication } = require("../utils/check_auth");
let jwt = require("jsonwebtoken");
let constants = require("../utils/constants");
let { validate, userValidation } = require("../utils/validator");
let crypto = require('crypto')
let mailer = require('../utils/mailer')

router.post(
  "/login",
  userValidation,
  validate,
  async function (req, res, next) {
    try {
      let username = req.body.username;
      let password = req.body.password;
      let result = await userControllers.checkLogin(username, password);
      res.status(200).send({
        success: true,
        data: jwt.sign(
          {
            id: result,
            expireIn: new Date(Date.now() + 3600 * 1000).getTime(),
          },
          constants.SECRET_KEY
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/signup",
  userValidation,
  validate,
  async function (req, res, next) {
    try {
      let username = req.body.username;
      let password = req.body.password;
      let email = req.body.email;
      let result = await userControllers.createAnUser(
        username,
        password,
        email,
        "user"
      );
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/me", check_authentication, async function (req, res, next) {
  try {
    res.send({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/changepassword",
  check_authentication,
  async function (req, res, next) {
    try {
      let oldpassword = req.body.oldpassword;
      let newpassword = req.body.newpassword;

      let user = userControllers.changePassword(
        req.user._id,
        oldpassword,
        newpassword
      );
      res.status(200).send({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/forgotpassword", async function (req, res, next) {
  try {
    let email = req.body.email;
    let user = await userControllers.getUserByEmail(email);
    if (!user) {
      throw new Error("email khong ton  tai");
    }
    user.ResetPasswordToken = crypto.randomBytes(30).toString("hex");
    user.ResetPasswordTokenExp = new Date(Date.now() + 20 * 60 * 1000);
    await user.save();
    let URL = `http://localhost:3000/auth/resetpassword/${user.ResetPasswordToken}`;
    await mailer.send(user.email, URL);
    res.send({
      success: true,
      data: URL,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/resetpassword/:token", async function (req, res, next) {
  try {
    let token = req.params.token;
    let password = req.body.password;
    let user = await userControllers.getUserByToken(token);
    if (!user) {
      throw new Error("token khong hop le");
    }
    if (user.ResetPasswordTokenExp < Date.now()) {
      throw new Error("token het han");
    }
    user.password = password;
    user.ResetPasswordToken = null;
    user.ResetPasswordTokenExp = null;
    await user.save();
    res.send({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
