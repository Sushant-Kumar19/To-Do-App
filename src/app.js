const express = require("express");
const app = express();
const path = require("path");
require("./db/conn");
const Register = require("./models/registers");
const Task = require("./models/tasks");
const { json } = require("express");
const hbs = require("hbs");

const port = process.env.PORT || 3000;

// Set up static files
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

// Set up view engine
app.set("view engine", "hbs");
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Home route
app.get("/", (req, res) => {
    res.render("index");
});

// Login route
app.get("/login", (req, res) => {
    res.render("login");
});

// Home route after login
app.get("/home", async (req, res) => {
    const tasks = await Task.find();
    const todayTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDateTime);
        return dueDate.toDateString() === new Date().toDateString();
    }).map(task => ({
        ...task.toObject(),
        remainingTime: Math.max(0, Math.floor((new Date(task.dueDateTime) - new Date()) / (1000 * 60))) // Remaining time in minutes
    }));

    res.render("home", { tasks, todayTasks });
});

// Login POST route
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

// Registration route
app.get("/register", (req, res) => {
    res.render("register");
});

// Registration POST route
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

// Add a new task
app.post("/add-task", async (req, res) => {
    const { task, dueDateTime } = req.body;
    const newTask = new Task({
        task,
        dueDateTime
    });

    try {
        await newTask.save();
        res.redirect("/home"); // Redirect to the home page after adding the task
    } catch (err) {
        console.error('Error saving task:', err);
        res.status(500).send('Error saving task');
    }
});

// Delete a task
app.post("/delete-task/:id", async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect("/home"); // Redirect to the home page after deleting the task
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Error deleting task');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});
