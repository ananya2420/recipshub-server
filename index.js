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
            const { search, page, perPage, userId } = req.query;
            const query = {};

            if (userId) {
                query.userId = userId;
            }

            if (search && search !== "undefined") {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
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


    app.post("/api/recips", async (req, res) => {
        try {
            const newRecipe = req.body;
            // Ensure fields match your form: name, category, cuisineType, difficultyLevel, 
            // preparationTime, ingredients, instructions, image, userId
            const result = await recipeCollection.insertOne(newRecipe);
            res.status(201).send({ insertedId: result.insertedId });
        } catch (err) {
            console.error("Error inserting recipe:", err);
            res.status(500).send({ message: "Failed to create recipe" });
        }
    });
    
    app.get("/recipe/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const recipe = await recipeCollection.findOne(query);

        if (!recipe) {
            return res.status(404).send({ message: "Recipe not found" });
        }
        res.send(recipe);
    } catch (err) {
        console.error("Error fetching recipe:", err);
        res.status(500).send({ message: "Server error" });
    }
});



    app.patch("/recipe/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const updateData = req.body;
            const result = await recipeCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Recipe not found" });
            }
            res.send({ message: "Recipe updated successfully" });
        } catch (err) {
            res.status(500).send({ message: "Server error" });
        }
    });

//recipe related apis

    app.post("/recips", async (req, res) => {
          const recipe=req.body;
          const result=await recipeCollection.insertOne(recipe);
          res.send(result);
    })


    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run();


//git rm --cached .env
