const express = require("express");
const route = express.Router();
const db = require("../db/database");
const nodemailer = require("nodemailer");
const { date } = require("joi");

const usersPostCombined = async (req, res) => {
  const [sum] = await db("posts").select("*");
  const data = await db("posts")
    .leftJoin("users", "users.id", "posts.user_id")
    .select("users.name", "users.email", "posts.title", "posts.views")
    .count("posts.id as total_posts")
    .sum("posts.views as total_views")
    .having("views", ">", 200)
    .groupBy("users.name", "users.email", "posts.title", "posts.views");
  const a = new Date();
  res.json(a);
};

const userPostsApi = async (req, res) => {
  try {
    const { user_id, title, views } = req.body;

    const id = await db("posts")
      .insert({
        user_id: user_id,
        title: title,
        views: views,
      })
      .returning("id");
    return res.status(201).json({ message: `post created` });
    // }
  } catch (e) {
    return res.json({ errormessage: e.detail });
  }
};

route.post("/userPostsApi", userPostsApi);
route.post("/usersPostCombined", usersPostCombined);

module.exports = route;
