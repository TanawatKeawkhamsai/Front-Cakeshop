const express = require('express');
const axios = require('axios');
const app = express();
const path = require("path");
var bodyParser = require('body-parser');
const { clearConfigCache } = require("prettier");

const base_url = "http://localhost:3000";
//const base_url = "http://  Ruk-Com";

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));

const authenticateUser = (req, res, next) => {
    if (req.cookies && req.cookies.userSession) {
      next();
    } else {
      res.redirect("/");
    }
  };

app.get("/", (req, res) => {
    res.render("home"); 
});

app.get("/home", (req, res) => {
    res.render("home"); 
});

//register

app.get("/register", (req, res) => {
    try {
      res.render("Register");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
      res.redirect("/");
    }
  });
  
  app.post("/register", async (req, res) => {
    try {
      const data = {
        customer_username: req.body.customer_username,
        customer_password: req.body.customer_password,
        Address: req.body.Address,
        email: req.body.email,
      };
      console.log(data);
      await axios.post(base_url+"/register", data);
  
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.status(500).send("error in /register");
    }
  });

  //login
app.get("/login", (req, res) => {
    try {
      res.render("login");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
      res.redirect("/");
    }
  });

  //Menu-Customer
  app.get("/menu_customer", (req, res) => {
    try {
      res.render("menu_customer");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
    }
  });

  //menu for customer
  app.get("/menu_customer", authenticateUser, async (req, res) => {
    try {
      const response = await axios.get(base_url + "/menu_customer");
  
      if (!req.session.user) {
        console.log("Logged in");
        req.session.user = {
          customer_id: "0",
        };
      }
  
      res.render("menu_customer", { Item: response.data, user: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
      res.redirect("/");
    }
  });

  


app.listen(5500, () => {
    console.log("server started on port 5500");
});

  


