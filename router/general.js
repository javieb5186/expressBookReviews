const express = require("express");
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

// cURL Command:
// curl -X POST -H "Content-Type: application/json" -d '{"username": "jack", "password": "jack123"}' localhost:5000/register

// Register user if they don't already exist
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password)
    return res.status(400).json({ message: "Unable to register user" });

  const foundUser = users.find((user) => user.username === username);

  if (foundUser)
    return res.status(400).json({ message: "User already exists" });

  console.log("All users before", users);

  users.push({ username: username, password: password });

  console.log("All users after", users);
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  let promise = new Promise((resolve, reject) => {
    let data = JSON.stringify(books, null, 4);
    resolve(data);
  });

  const results = await promise;
  return res.status(200).send(results);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const data = JSON.stringify(books[isbn], null, 4);
    resolve(data);
  });

  const results = await promise;
  return res.status(200).send(results);
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const notSafeAuthorURL = req.params.author;
    const safeAuthor = notSafeAuthorURL.split("+").join(" ");
    const booksArr = Object.values(books);
    const results = booksArr.filter((book) => book.author === safeAuthor);
    const data = JSON.stringify(results, null, 4);
    resolve(data);
  });

  const results = await promise;
  return res.status(200).send(results);
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const notSafeTitleURL = req.params.title;
    const safeTitle = notSafeTitleURL.split("+").join(" ");
    const booksArr = Object.values(books);
    const results = booksArr.filter((book) => book.title === safeTitle);
    const data = JSON.stringify(results, null, 4);
    resolve(data);
  });

  const results = await promise;
  return res.status(200).send(results);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn].reviews);
});

module.exports.general = public_users;
