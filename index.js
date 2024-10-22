const nodemailer = require("nodemailer");
const express = require("express");
// const fs = require("fs-extra");
// const path = require("path");
// const Joi = require("joi");
const app = express();
const knex = require("./db/database.js");
// const cron = require("node-cron");
const posts = require("./routes/posts.js");
const users = require("./routes/users.js");
// const sendmail = require("./routes/smtp.js");

app.use(express.json());
app.use("/", posts);
app.use("/", users);
// app.use("/", sendmail);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
