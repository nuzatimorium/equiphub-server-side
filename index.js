    const express = require("express");
    const cors = require("cors");
    const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
    require("dotenv").config();

    const app = express();
    const port = process.env.PORT || 5000;
    const uri = process.env.MONGO_URI;

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    app.use(express.json());
    app.use(cors());

    async function run() {
        try {
            await client.connect();
            console.log("Successfully connected to MongoDB!");

            const db = client.db("equiphub");
            const equipmentCollection = db.collection("equipments");

            app.get("/products", async (req, res) => {
                try {
                    const products = await equipmentCollection.find().limit(6).toArray();
                    res.json(products);
                } catch (error) {
                    console.error("Error fetching products:", error);
                    res.status(500).json({ error: "Failed to fetch products" });
                }
            });

            app.post("/equipments", async (req, res) => {
                try {
                    const newEquipment = req.body;
                    const result = await equipmentCollection.insertOne(newEquipment);
                    res.send(result);
                } catch (err) {
                    res.status(500).send({ error: err.message });
                }
            });

            app.get("/equipments", async (req, res) => {
                try {
                    const result = await equipmentCollection.find().toArray();
                    res.send(result);
                } catch (err) {
                    res.status(500).send({ error: err.message });
                }
            });

            app.get("/equipments/:id", async (req, res) => {
                try {
                    const id = req.params.id;
                    const query = { _id: new ObjectId(id) };
                    const equipment = await equipmentCollection.findOne(query);
                    res.send(equipment);
                } catch (err) {
                    res.status(500).send({ error: err.message });
                }
            });

            app.get("/my-equipment", async (req, res) => {
                try {
                    const userEmail = req.query.email;
                    const equipments = await equipmentCollection.find({ userEmail }).toArray();
                    res.send(equipments);
                } catch (err) {
                    res.status(500).send({ error: "Failed to fetch equipment." });
                }
            });

            app.delete("/equipment/:id", async (req, res) => {
                const id = req.params.id;
                try {
                    const result = await equipmentCollection.deleteOne({ _id: new ObjectId(id) });
            
                    if (result.deletedCount > 0) {
                        res.status(200).json({ message: "Item deleted successfully!" });
                    } else {
                        res.status(404).json({ message: "Item not found." });
                    }
                } catch (error) {
                    res.status(500).json({ message: "Error deleting item", error });
                }
            });

            app.put("/equipment/:id", async (req, res) => {
                const id = req.params.id;
                const updatedData = req.body;
                
                try {
                    const result = await equipmentCollection.updateOne(
                        { _id: new ObjectId(id) },
                        { $set: updatedData }
                    );
            
                    if (result.modifiedCount > 0) {
                        res.status(200).json({ message: "Equipment updated successfully!" });
                    } else {
                        res.status(400).json({ message: "No changes made, please check your data." });
                    }
                } catch (error) {
                    res.status(500).json({ message: "Error updating item", error });
                }
            }); 

        } catch (err) {
            console.error("Failed to connect to MongoDB:", err.message);
        }
    }
    run().catch(console.dir);

    app.get("/", (req, res) => {
        res.send("Equip hub is running!");
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });