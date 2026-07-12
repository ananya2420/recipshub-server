const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_DB_URL);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("recipeshub_db");
    const recipeCollection = database.collection("recips"); 

    app.get("/", (req, res) => {
      res.send("Server is running!");
    });

   app.get("/recips", async (req, res) => {

        try {

            const { search, page, perPage } = req.query;

            const query = {};



            if (search && search !== "undefined") {

                query.$or = [

                    { title: { $regex: search, $options: 'i' } },

                    { description: { $regex: search, $options: 'i' } }

                ];

            }



            if (page) {

                const pageNum = parseInt(page) || 1;

                const limitNum = parseInt(perPage) || 10;

                const recipes = await recipeCollection

                    .find(query)

                    .skip((pageNum - 1) * limitNum)

                    .limit(limitNum)

                    .toArray();

               

                return res.send(recipes);

            }



            const result = await recipeCollection.find(query).toArray();

            res.send(result);

        } catch (dbError) {

            console.error("Database query error:", dbError);

            res.status(500).send("Error fetching data");

        }

    });


    app.get("/recipe/:id", async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).send({ message: "Invalid ID format" });
            }
            const result = await recipeCollection.findOne({ _id: new ObjectId(req.params.id) });
            result ? res.send(result) : res.status(404).send({ message: "Recipe not found" });
        } catch (err) {
            res.status(500).send({ message: "Server error" });
        }
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run();