const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGO_URI = "mongodb://127.0.0.1:27017/petmate";

const collections = {
    users: "petmate.users.json",
    pets: "petmate.pets.json",
    adoptionrequests: "petmate.adoptionrequests.json",
    admin_actions: "petmate.admin_actions.json"
};

const views = {
    pendingPetsView: {
        viewOn: "pets",
        pipeline: [
            { $match: { status: "pending" } },
            {
                $lookup: {
                    from: "users",
                    localField: "addedBy",
                    foreignField: "_id",
                    as: "addedByUser"
                }
            },
            { $unwind: "$addedByUser" },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    type: 1,
                    ageYears: 1,
                    ageMonths: 1,
                    description: 1,
                    status: 1,
                    "addedByUser.name": 1
                }
            }
        ]
    },

    pendingUsersView: {
        viewOn: "users",
        pipeline: [
            { $match: { status: "pending" } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    status: 1,
                    createdAt: 1
                }
            }
        ]
    },

    pendingAdoptionRequestsView: {
        viewOn: "adoptionrequests",
        pipeline: [
            { $match: { status: "pending" } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "pets",
                    localField: "petId",
                    foreignField: "_id",
                    as: "pet"
                }
            },
            { $unwind: "$user" },
            { $unwind: "$pet" },
            {
                $project: {
                    status: 1,
                    requestDate: 1,
                    "user.name": 1,
                    "user.email": 1,
                    "pet.name": 1,
                    "pet.type": 1
                }
            }
        ]
    }
};

function convertMongoValues(value) {
    if (Array.isArray(value)) {
        return value.map(convertMongoValues);
    }

    if (value && typeof value === "object") {
        if (value.$oid) {
            return new mongoose.Types.ObjectId(value.$oid);
        }

        if (value.$date) {
            return new Date(value.$date);
        }

        const converted = {};

        for (const key of Object.keys(value)) {
            converted[key] = convertMongoValues(value[key]);
        }

        return converted;
    }

    return value;
}

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGO_URI);

        console.log("Connected to MongoDB.");

        const db = mongoose.connection.db;

        // Restore collections
        for (const [collectionName, fileName] of Object.entries(collections)) {
            const filePath = path.join(__dirname, fileName);

            console.log(`\nImporting ${collectionName}...`);

            if (!fs.existsSync(filePath)) {
                console.log(`File not found: ${fileName}`);
                continue;
            }

            const rawData = JSON.parse(
                fs.readFileSync(filePath, "utf8")
            );

            const data = convertMongoValues(rawData);

            const collectionExists = await db
                .listCollections({ name: collectionName })
                .hasNext();

            if (collectionExists) {
                await db.collection(collectionName).drop();

                console.log(
                    `Existing ${collectionName} collection removed.`
                );
            }

            if (data.length > 0) {
                await db.collection(collectionName).insertMany(data);

                console.log(
                    `${collectionName}: ${data.length} documents imported.`
                );
            } else {
                await db.createCollection(collectionName);

                console.log(
                    `${collectionName}: empty collection created.`
                );
            }
        }

        // Restore views
        console.log("\nCreating database views...");

        for (const [viewName, viewDefinition] of Object.entries(views)) {
            const existing = await db
                .listCollections({ name: viewName })
                .toArray();

            if (existing.length > 0) {
                if (existing[0].type === "view") {
                    await db.command({
                        drop: viewName
                    });

                    console.log(
                        `Existing view ${viewName} removed.`
                    );
                } else {
                    await db.collection(viewName).drop();

                    console.log(
                        `Existing collection ${viewName} removed.`
                    );
                }
            }

            await db.createCollection(viewName, {
                viewOn: viewDefinition.viewOn,
                pipeline: viewDefinition.pipeline
            });

            console.log(
                `View ${viewName} created successfully.`
            );
        }

        console.log("\n=========================================");
        console.log("PetMate database setup completed!");
        console.log("=========================================");

    } catch (error) {
        console.error("\nDatabase setup failed:");
        console.error(error);

    } finally {
        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
    }
}

seedDatabase();