import jwt from "jsonwebtoken";

export const login = (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.USERNAME &&
    password === process.env.PASSWORD
  ) {
    const token = jwt.sign(
      { username: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
};