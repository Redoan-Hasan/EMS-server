const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: [
      "https://ems-server-eight.vercel.app",
      "http://localhost:5173",
      "https://https://ems-server-eight.vercel.app",
      "https://ems-d3e23.web.app"
    ],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhz4s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("EMS").collection("EMS-tasks");
    const employeeCollection = client.db("EMS").collection("EMS-employees");
    const completedTaskCollection = client
      .db("EMS")
      .collection("EMS-completedTasks");

    // getting all the pending tasks
    app.get("/allPendingTasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    // getting all the completed tasks
    app.get("/allCompletedTask", async (req, res) => {
      const result = await completedTaskCollection.find().toArray();
      res.send(result);
    });

    app.post("/completedTask", async (req, res) => {
      const completedTask = req.body;
      console.log(completedTask);
      const result = await completedTaskCollection.insertOne(completedTask);
      res.send(result);
    });

    app.get("/completedTask", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = completedTaskCollection.find(query).sort({ priority: 1 });
      const tasks = await cursor.toArray();
      res.send(tasks);
    });

    app.post("/addEmployee", async (req, res) => {
      const newEmployee = req.body;
      console.log(newEmployee);
      const result = await employeeCollection.insertOne(newEmployee);
      res.send(result);
    });

    app.get("/addEmployee", async (req, res) => {
      const cursor = await employeeCollection.find().toArray();
      res.send(cursor);
    });

    app.post("/addTask", async (req, res) => {
      const newTask = req.body;
      console.log(newTask);
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

    app.get("/addTask", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = taskCollection.find(query).sort({ priority: 1 });
      const tasks = await cursor.toArray();
      res.send(tasks);
    });

    app.get("/addTask/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const task = await taskCollection.findOne(query);
      res.send(task);
    });

    app.delete("/addTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from EMS Server");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
