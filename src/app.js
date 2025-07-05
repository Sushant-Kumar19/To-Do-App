const express = require("express");
const app = express();
const path =require("path");
require("./db/conn");
const Register= require("./models/registers");
const {json}= require("express");

const hbs= require("hbs");

const port = process.env. PORT || 3000;

// const static_path=path.join(__dirname,"../public");

// app.use(express.static(static_path))
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

app.set("view engine", "hbs" );
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded



app.get("/", (req, res)=> {
res.render("index") 
});

app.get("/login", (req, res) => {
    res.render("login");
});
// app.post("/login", (req, res) => {
//     res.redirect("/home");
// });

app.get("/home", (req, res) => {
    res.render("home");
});




app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Register.findOne({ email: email });
    if (!user) {
      return res.status(400).send("Invalid login credentials. User not found.");
    }
    if (user.password !== password) {
      return res.status(400).send("Invalid login credentials. Password incorrect.");
    }
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const registerEmployee = new Register({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        const register = await registerEmployee.save();
        res.status(201).render("index");
    } catch (error) {
        console.error("Error saving to MongoDB:", error); // Log the error
        res.status(400).send(error);
    }
});



app.listen(port, ()=> {
console.log(`server is running at port no ${port}`);
})