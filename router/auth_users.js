const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "jane", password: "jane123" },
  { username: "john", password: "john123" },
];

// Check if username and password match the one we have in user records.
const authenticatedUser = (username, password) => {
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );
  return foundUser ? true : false;
};

// cURL command:
// curl -X POST -H "Content-Type: application/json" -d '{"username": "john", "password": "pass123"}' -c cookies.txt http://localhost:5000/customer/login

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password)
    return res.status(400).json({ message: "Error logging in" });

  if (!authenticatedUser(username, password))
    return res.status(400).json({ message: "Invalid Login" });

  const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 });
  req.session.authorization = {
    accessToken,
    username,
  };

  return res.status(200).send({ message: "User successfully logged in" });
});

// cURL command:
// curl -X DELETE -b cookies.txt http://localhost:5000/customer/auth/review/1

// Delete user review by logged in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  delete books[isbn].reviews[username];
  console.log("Book reviews", books[isbn].reviews);
  return res.status(200).json({ message: "User review successfully deleted" });
});

// cURL command:
// curl -X PUT -b cookies.txt http://localhost:5000/customer/auth/review/1?review=this+is+a+message

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const notSafeReviewURL = req.query.review;
  const safeReview = notSafeReviewURL.split("+").join(" ");
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  books[isbn].reviews[username] = safeReview;

  console.log("Book reviews", books[isbn].reviews);
  return res.status(200).json({ message: "User successfully reviewed book" });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
