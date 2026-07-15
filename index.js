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
    const reportCollection = database.collection("reports");
     const likeCollection = database.collection("likes");
     const purchaseCollection = database.collection("purchases");
    const favoriteCollection = database.collection("favorites");
    const paymentCollection = database.collection("payments");
    const sessionCollection = database.collection("session");

    app.get("/", (req, res) => {
      res.send("Server is running!");
    });

    const logger=(req,res,next)=>{
        console.log('logger logged',req.params);
        next();
    }

    const verifyToken=async(req,res,next)=>{
        console.log('headers',req.headers);
        const authHeader=req.headers?.authorization;
        if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
        const token=authHeader.split(' ')[1]
        if(!token){
            return res.status(401).send({message:'unauthorized access'})
        }
        const query={token:token}
        const session=await sessionCollection.findOne(query);

        console.log(session);

        const userId=session.userId;
        //console.log('user id of the session',userId);

        const userQuery={
            _id:userId
        }
        const user=await usersCollection.findOne(userQuery);
       console.log('user id of the session',user);
        next();

    }

    //must be used after verifyToken middleware
    const verifyUser = async (req, res, next) => {
        // This assumes verifyToken has already run and attached the session/user info
        // Adjust the logic below based on how your 'verifyToken' stores the user
         if (req.user?.role !== 'user') {
        return res.status(403).send({ message: 'forbidden access' })
        }
        next();
    };
    
    // //must be used after verifyToken middleware
    const verifyAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
}

   app.get("/recips", async (req, res) => {
        try {
            const { search, page, perPage, userId, category } = req.query;
            const query = {};

            if (userId) {
                query.userId = userId;
            }

            if (category && category !== "undefined") {
            
            query.category = { $in: [category] };
        }

            if (search && search !== "undefined") {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            if (page) {
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(perPage) || 32;
                const recipes = await recipeCollection
                    .find(query)
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum)
                    .toArray();
                return res.send(recipes);
            }
            if (req.query.featured === "true") {
             query.isFeatured = true;
            }

            const result = await recipeCollection.find(query).toArray();
            res.send(result);
        } catch (dbError) {
            console.error("Database query error:", dbError);
            res.status(500).send("Error fetching data");
        }
    });
    

    // application related apis
app.get('/api/applications', verifyToken, verifyUser, async (req, res) => {
    const query = {};
    if (req.query.applicantId) {
        query.applicantId = req.query.applicantId;

        // check whether asking for user information or someone else
        console.log(req.user, req.query.applicantId)
        if (req.user._id.toString() !== req.query.applicantId) {
            return res.status(403).send({ message: 'forbidden access' })
        }

    }
    if (req.query.recipeId) {
        query.recipeId = req.query.recipeId;
    }
    const cursor = applicationsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
})

app.post('/api/applications', async (req, res) => {
    const application = req.body;
    const newApplication = {
        ...application,
        createdAt: new Date()
    }
    const result = await applicationsCollection.insertOne(newApplication);
    res.send(result);
})


    app.post("/api/recips",verifyToken, async (req, res) => {
        try {
            const newRecipe = req.body;
            
            const result = await recipeCollection.insertOne(newRecipe);
            res.status(201).send({ insertedId: result.insertedId });
        } catch (err) {
            console.error("Error inserting recipe:", err);
            res.status(500).send({ message: "Failed to create recipe" });
        }
    });


    // Example Express.js backend route
// Fix this block in your server.js
app.delete('/api/recipes/:id', logger,verifyToken,verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Use 'recipeCollection' (which you defined earlier)
    // 2. Ensure the ID is a valid MongoDB ObjectId
    const result = await recipeCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Recipe not found" });
    }
    
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete" });
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
    console.log("DEBUG: Fetching purchases for userId:", req.params.userId);
    const purchaseCollection = client.db("recipeshub_db").collection("purchases");
    const purchases = await purchaseCollection.find({ userId: req.params.userId }).toArray();
    console.log("DEBUG: Found purchases:", purchases);
    res.send(purchases);
});




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
    
    // Get all pending reports
// Fetch reports
    app.get("/api/reports", async (req, res) => {
        try {
            const reports = await reportCollection.find({ status: "pending" }).toArray();
            res.send(reports);
        } catch (err) {
            res.status(500).send({ message: "Failed to fetch" });
        }
    });



// Remove Recipe
    app.delete("/api/admin/remove-recipe/:recipeId/:reportId", async (req, res) => {
        try {
            await recipeCollection.deleteOne({ _id: new ObjectId(req.params.recipeId) });
            await reportCollection.updateOne(
                { _id: new ObjectId(req.params.reportId) }, 
                { $set: { status: "removed" } }
            );
            res.status(200).send({ message: "Success" });
        } catch (err) {
            res.status(500).send({ message: "Failed" });
        }
    });

// Dismiss Report
    app.patch("/api/admin/dismiss-report/:reportId", async (req, res) => {
        try {
            await reportCollection.updateOne(
                { _id: new ObjectId(req.params.reportId) }, 
                { $set: { status: "dismissed" } }
            );
            res.send({ message: "Dismissed" });
        } catch (err) {
            res.status(500).send({ message: "Failed" });
        }
    });

    // Add this to your server.js inside the `run()` function
app.get("/api/popular-recipes", async (req, res) => {
    try {
        const popularRecipes = await likeCollection.aggregate([
            {
                // Group by recipeId and count occurrences
                $group: {
                    _id: "$recipeId",
                    likesCount: { $sum: 1 }
                }
            },
            { $sort: { likesCount: -1 } }, // Most liked first
            { $limit: 4 }, // Limit to top 4
            {
                // Join with the original recipe collection to get title/author details
                $lookup: {
                    from: "recips", // Ensure this matches your collection name
                    localField: "_id",
                    foreignField: "_id",
                    as: "recipeDetails"
                }
            },
            { $unwind: "$recipeDetails" }
        ]).toArray();

        res.send(popularRecipes);
    } catch (err) {
        res.status(500).send({ message: "Failed to fetch popular recipes" });
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





//.env
//git rm --cached .env
//git add .gitignore
//git commit -m "chore: stop tracking .env file"
// git push