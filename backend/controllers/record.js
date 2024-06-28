import db from "../db.js";
import jwt from "jsonwebtoken";
export const getRecords = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, "jwtKey", async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const gamesRecords = await db("recordGame")
        .select(
          "recordGame.*",
          "user1.username as player1_name",
          "user2.username as player2_name"
        )
        .join("users as user1", "recordGame.player1_id", "=", "user1.id")
        .join("users as user2", "recordGame.player2_id", "=", "user2.id")
        .where("player1_id", user.id)
        .orWhere("player2_id", user.id)
        .orderBy("recordGame.created_at", "desc");
      res.json(gamesRecords);
    } catch (err) {
      console.log(err);
    }
  });
};
