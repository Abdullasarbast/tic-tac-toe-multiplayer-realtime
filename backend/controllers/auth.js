import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
  //check existing user using knex
  //check for username and email
  const { username, email, password } = req.body;

  
  const user = await db("users").where({ username }).orWhere({ email }).first();
  if (user) {
    return res.status(409).json({ message: "User already exists" });
  }
  //hash the password using bcrypt
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  //insert user into database
  try {
    await db("users").insert({
      username: username,
      email: email,
      password: hash,
    });
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await db("users").where({ username }).first();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "jwtKey", {
    expiresIn: "30d",
  });

  const { password: _, ...other } = user;

  res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json(other);
};

export const logout = async (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json({ message: "User logged out" });
};

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

