const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iixzvov.mongodb.net/?retryWrites=true&w=majority`;

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
    const seedsCollection = client.db("BitnBuild").collection("seeds");
    const historyCollection = client.db("BitnBuild").collection("history");
    const equipmentsCollection = client
      .db("BitnBuild")
      .collection("equipments");

    // POST API FOR SEEDS
    app.post("/seeds", async (req, res) => {
      const seedInfo = req.body;
      const result = await seedsCollection.insertOne(seedInfo);
      res.send(result);
    });

    // GET API FOR SEEDS
    app.get("/seeds/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const seeds = await seedsCollection.find(query).toArray();
      res.send(seeds);
    });

    // UPDATE VOLUME FOR SEEDS
    app.get("/seeds/:email/:id/:type/:amount", async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const type = req.params.type;
      const amount = req.params.amount;
      const query = {
        _id: new ObjectId(id),
        email: email,
      };

      const currentSeed = await seedsCollection.findOne(query);

      let updatedSeed = {};
      if (type === "increase") {
        updatedSeed = {
          $set: {
            volume: currentSeed.volume + parseInt(amount),
          },
        };
      } else {
        updatedSeed = {
          $set: {
            volume: currentSeed.volume - parseInt(amount),
          },
        };
      }
      const result = await seedsCollection.updateOne(query, updatedSeed);

      res.send(result);
    });

    // HISTORY POST API
    app.post("/history", async (req, res) => {
      const record = req.body;
      const result = await historyCollection.insertOne(record);
      res.send(result);
    });

    // HISTORY GET API
    app.get("/history/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const seeds = await historyCollection.find(query).toArray();
      res.send(seeds);
    });

    // EQUIPMENT GET API
    app.get("/equipments/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const equipments = await equipmentsCollection.find(query).toArray();
      res.send(equipments);
    });

    // EQUIPMENT POST API
    app.post("/equipments", async (req, res) => {
      const equipmentInfo = req.body;
      const result = await equipmentsCollection.insertOne(equipmentInfo);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
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
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("Server listening on port", port);
});
