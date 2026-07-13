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

    // Inside your server.js
app.post("/api/payments", async (req, res) => {
    try {
        const { recipeId, title, price, userId } = req.body;
        
        // Save to a "purchases" collection in MongoDB
        const purchaseCollection = client.db("recipeshub_db").collection("purchases");
        
        const result = await purchaseCollection.insertOne({
            userId,      // Link purchase to the specific user
            recipeId,
            title,
            amountPaid: price,
            date: new Date().toLocaleDateString() // e.g., 16/06/2026
        });
        
        res.status(201).send(result);
    } catch (err) {
        res.status(500).send({ message: "Failed to save purchase" });
    }
});


  // Inside your server.js
app.get("/api/purchases/:userId", async (req, res) => {
    const purchaseCollection = client.db("recipeshub_db").collection("purchases");
    const purchases = await purchaseCollection.find({ userId: req.params.userId }).toArray();
    res.send(purchases);
});

//recipe related apis

    app.post("/recips", async (req, res) => {
          const recipe=req.body;
          const result=await recipeCollection.insertOne(recipe);
          res.send(result);
    })


// --- Favorites API Routes ---

    // 1. Add to Favorites
    app.post("/api/favorites", async (req, res) => {
        try {
            const favoriteCollection = client.db("recipeshub_db").collection("favorites");
            const result = await favoriteCollection.insertOne(req.body);
            res.status(201).send(result);
        } catch (err) {
            res.status(500).send({ message: "Failed to add to favorites" });
        }
    });

    // 2. Get Favorites for a User
    app.get("/api/favorites/:userId", async (req, res) => {
        try {
            const favoriteCollection = client.db("recipeshub_db").collection("favorites");
            const favorites = await favoriteCollection.find({ userId: req.params.userId }).toArray();
            res.send(favorites);
        } catch (err) {
            res.status(500).send({ message: "Failed to fetch favorites" });
        }
    });

    // 3. Remove from Favorites
    app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
        try {
            const favoriteCollection = client.db("recipeshub_db").collection("favorites");
            const result = await favoriteCollection.deleteOne({ 
                userId: req.params.userId, 
                recipeId: req.params.recipeId 
            });
            res.send(result);
        } catch (err) {
            res.status(500).send({ message: "Failed to remove from favorites" });
        }
    });


    // Add this route to record payments in your "payments" collection
app.post("/api/save-payment", async (req, res) => {
    try {
        const { sessionId, userId, email, amount, status } = req.body;

        const paymentCollection = client.db("recipeshub_db").collection("payments");

        // Check if this payment already exists to prevent duplicates
        const existing = await paymentCollection.findOne({ sessionId: sessionId });

        if (!existing) {
            await paymentCollection.insertOne({
                sessionId,
                userId,
                email,
                amount,
                status,
                createdAt: new Date(),
            });
            return res.status(201).send({ message: "Payment saved successfully" });
        }
        
        res.status(200).send({ message: "Payment already recorded" });
    } catch (err) {
        console.error("Failed to save to MongoDB:", err);
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


//git rm --cached .env
