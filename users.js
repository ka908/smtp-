const express = require("express");
const route = express.Router();
const verify = require("./mware");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const nodemailer = require("nodemailer");
const schema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});
const resetPassword = async (req, res) => {
  try {
    let data = {
      email: req.body.email,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
      otp: req.body.otp,
    };
    const resetSchema = Joi.object({
      email: Joi.string().email().required(),
      oldPassword: Joi.string().min(3).required(),
      newPassword: Joi.string().min(3).required(),
      otp: Joi.number().integer().required(),
    });
    const { error } = resetSchema.validate(data);
    if (error) {
      return res.json({ Validationerror: error.details[0].message });
    }
    const user = await db("users").where("email", data.email).first();
    console.log(user);
    const isPassword = bcrypt.compareSync(data.oldPassword, user.password);
    console.log(typeof data.otp);
    console.log(typeof user.otp);

    if (data.otp !== user.otp) {
      return res.status(403).json({ message: `otp not matched` });
    }
    if (user && isPassword && data.otp === user.otp) {
      let passwordHash = bcrypt.hashSync(data.newPassword, 8);
      const id = await db("users")
        .where({ email: data.email })
        .update({
          password: passwordHash,
        })
        .returning("id");
      return res
        .status(201)
        .json({ message: `password reset use new password to login` });
    } else {
      return res.status(403).json({ message: `email/password not matched` });
    }
  } catch (e) {
    return res.json({ errormessage: e.detail });
  }
};

const forgotPassSendOtpToEmail = async (req, res) => {
  try {
    const jwtID = req.user.id;
    const id = req.body.id;
    const boolean = id === jwtID;
    console.log(req.user);
    let data = {
      email: req.body.email,
    };
    const fschema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = fschema.validate(data);
    if (error) {
      return res.json({ Validationerror: error.details[0].message });
    }
    const user = await db("users").where("email", data.email).first();
    if (user && id === jwtID) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "huzaifa009428@gmail.com",
          pass: "ldhr untp qvrq vqsi",
        },
      });
      const mailOptions = {
        from: "huzaifa009428@gmail.com",
        to: data.email,
        subject: "Hello from gmail via Node.js",
        text: String(user.otp),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return res.status(200).json({ message: "Email sent successfully" });
    } else {
      return res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Error sending email" });
  }
};
const loginToGenerateJwt = async (req, res) => {
  try {
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error } = loginSchema.validate(userData);
    if (error) {
      return res.json({ message: error.details[0].message });
    }
    const checkingDB = await db("users")
      .where({ email: userData.email })
      .first();
    let passwordCheck = await bcrypt.compareSync(
      userData.password,
      checkingDB.password
    );
    if (checkingDB && passwordCheck) {
      const token = jwt.sign({ id: checkingDB.id }, process.env.SECRET);
      return res.json({ token: `Bearer ${token}` });
    } else {
      return res.json({ msg: "enter valid email and password" });
    }
  } catch {
    return res.status(500).json("invalid");
  }
};

const userSignUpApi = async (req, res) => {
  try {
    let data = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    const { error } = schema.validate(data);
    if (error) {
      return res.json({ Validationerror: error.details[0].message });
    }
    const user = await db("users").where("email", data.email).first();
    let passwordHash = bcrypt.hashSync(data.password, 8);
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    console.log(typeof otp);
    const id = await db("users")
      .insert({
        name: data.name,
        email: data.email,
        password: passwordHash,
        otp: otp,
      })
      .returning("id");
    return res.status(201).json({ message: `user hase been registered` });
    // }
  } catch (e) {
    return res.json({ errormessage: e.detail });
  }
};
// route.get("/paginate", paginate);
route.post("/loginToGenerateJwt", loginToGenerateJwt);
route.patch("/resetPassword", verify, resetPassword);
route.post("/forgotPassSendOtpToEmail", verify, forgotPassSendOtpToEmail);
route.post("/userSignUpApi", userSignUpApi);
module.exports = route;
