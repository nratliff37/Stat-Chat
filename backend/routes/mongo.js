const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Environment Variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = "test";

// MongoDB Schema Description
const schemaDescription = `
1. Collection: 'social_media'
    Each document in this collection represents a sports team and contains:
    - team: string (e.g. "arizona diamondbacks")
    - instagram: object
        - handle: string (e.g. "@dbacks")
        - following: integer
        - followers: integer
        - posts: integer
    - X: object
        - handle: string (e.g. "dbacks")
        - following: integer
        - followers: integer
    - tiktok: object
        - handle: string (e.g. "dbacks")
        - following: integer
        - followers: integer
        - likes: integer

2. Collection: 'instagram'
    Each document represents a social media post made by a sports team on Instagram:
    - author: string — the Instagram handle (e.g. "@dbacks")
    - media: string — always "instagram"
    - caption: string
    - date: string — in MM-DD-YY format (e.g. "08-28-24")
    - likes: integer
    - link: string — URL to the post
    - tagged: array of strings — tagged accounts
    - team name: string — maps to 'social_media.team'

3. Collection: 'x'
    Each document represents a post made on X (formerly Twitter):
    - author: string — X handle (e.g. "dbacks")
    - media: string — always "x"
    - caption: string
    - date: string — MM-DD-YY
    - likes: integer
    - link: string — URL to the post
    - tagged: array of strings
    - team name: string — maps to 'social_media.team'

4. Collection: 'tiktok'
    Each document represents a TikTok post:
    - author: string — TikTok handle
    - media: string — always "tiktok"
    - caption: string
    - date: string — MM-DD-YY
    - likes: integer
    - link: string
    - tagged: array of strings
    - team name: string — maps to 'social_media.team'
`;

const systemPrompt = `
You are a MongoDB assistant that converts natural language into MongoDB operations.

You support:
    - find queries with optional projection
    - aggregate queries using: $match, $group, $sort, $limit, $skip, $project
    - $match can appear before or after $group
    - $lookup for joining collections
    - data modification with: insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany

Collections:
${schemaDescription}

If a user refers to a team by nickname (e.g., "Cubs", "Yankees", "Dodgers"), you must infer the full official team name (e.g., "Chicago Cubs", "New York Yankees", "Los Angeles Dodgers"). Always match using the full team name.

Convert team names to lowercase

If a case-insensitive regex is needed (e.g., to match "Cubs" in "Chicago Cubs"), return it using the $regex and $options syntax as valid JSON. For example:
{ "team": { "$regex": "Cubs", "$options": "i" } }

Do not use $unwind unless the field is an array. Fields like "instagram", "X", and "tiktok" are nested objects, not arrays.

If needed, to aggregate values across platforms, use $project to include each value explicitly (e.g., instagram.handle, tiktok.handle). Then use $project or $addFields to create arrays from them if needed.

Use $setUnion or $facet to combine if needed

Note: If using $setUnion, wrap all string values in square brackets to ensure they are treated as arrays. For example:

$setUnion: [ [ "$instagram.handle" ], [ "$X.handle" ], [ "$tiktok.handle" ] ]

Always use valid MongoDB syntax.

When dealing with instagram handles, assume they include an @ prefix unless explicitly stated otherwise.


- If a user does not specify the full format (e.g., says "update dodgers handle"), assume the correct prefix/syntax based on platform.

- This applies to insertOne, updateOne, find, and aggregate operations.


For updateOne, ensure that updates don't break referential logic. For example, changing team must also update related fields like instagram.handle if needed. Always include both old and new values clearly in the filter and $set.

Use only valid field names that exist in the data (e.g., "team", "author", "likes", "followers").

IMPORTANT: Do NOT use "team name" or fields not found in the schema. Autofill team name in ALL LOWERCASE LETTERS based on author if one isn't provided when inserting schema.

Always wrap values in the correct JSON types (e.g., numbers without quotes, strings with quotes).



Always return a single, valid JSON object. Return results without _id

The object must contain only the MongoDB operation and no explanation or commentary.

IMPORTANT:
- Never use [Object], [Array], or other placeholders. Instead, return fully expanded and valid JSON for every part of the query.
- Every aggregation stage (e.g., $match, $project, $sort) must contain exactly one key and one JSON object as its value.
- If uncertain, be conservative and use only simple, valid MongoDB syntax.
- Validate your output to ensure it parses as JSON and is directly usable by MongoDB clients.
- All keys must be in double quotes. All JSON returned must be parsable by JSON.parse().
- Do not include comments, markdown, or explanations. Only return the raw JSON object.


When calculating averages or ratios (e.g., likes per post), always add a $match stage before the $project to filter out documents where the denominator is zero, missing, or null.

For example, if calculating likes_per_post using "$divide": ["$instagram.likes", "$instagram.posts"], then first include:

{ "$match": { "instagram.posts": { "$gt": 0 } } }

This ensures valid division and prevents null results in aggregation outputs.


For example:

- For find:
  {
    "operation": "find",
    "collection": "collection_name",
    "filter": { ... },
    "projection": { ... }
  }

- For insertMany:
  {
    "operation": "insertMany",
    "collection": "collection_name",
    "documents": [ {...}, {...} ]
  }


    For find:
    {{ "operation": "find", "collection": "collection_name", "filter": {{ ... }}, "projection": {{ ... }} }}

    For aggregate:
    {{ "operation": "aggregate", "collection": "collection_name", "pipeline": [ ... ] }}

    For joins with $lookup:
    {{ "operation": "lookup_query", "collection": "collection_name", "pipeline": [ ... ] }}

    For insert:
    {{ "operation": "insertOne", "collection": "collection_name", "document": {{ ... }} }}

    For update:
    {{ "operation": "updateOne", "collection": "collection_name", "filter": {{ ... }}, "update": {{ ... }} }}

    For delete:
    {{ "operation": "deleteOne", "collection": "collection_name", "filter": {{ ... }} }}

    IMPORTANT: Do not include Markdown, do not wrap the response in json or javascript blocks.
    Do not include any extra explanation — only return pure JSON. Nothing else.
`;

async function getMongoQueryFromGPT(naturalLanguageQuery) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: naturalLanguageQuery }
    ]
  });

  return JSON.parse(completion.choices[0].message.content.trim());
}

async function executeMongoQuery(operationObj) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(operationObj.collection);
  
    let result;
    switch (operationObj.operation) {
      case "find":
        result = await collection.find(operationObj.filter || {}, operationObj.projection || {}).toArray();
        break;
  
      case "aggregate":
      case "lookup_query":
        result = await collection.aggregate(operationObj.pipeline).toArray();
        break;
  
      case "insertOne":
        const insert = await collection.insertOne(operationObj.document);
        result = [{ insertedId: insert.insertedId }];
        break;
  
      case "updateOne":
        const update = await collection.updateOne(operationObj.filter, operationObj.update);
        result = [{
          matchedCount: update.matchedCount,
          modifiedCount: update.modifiedCount
        }];
        break;
  
      case "deleteOne":
        const del = await collection.deleteOne(operationObj.filter);
        result = [{ deletedCount: del.deletedCount }];
        break;
  
      default:
        result = [{ error: "Unsupported MongoDB operation" }];
    }
  
    await client.close();
    return result;
}
  

// Route: POST /api/generate-mongo
router.post('/', async (req, res) => {
    const { userQuery } = req.body;
  
    try {
      const mongoOp = await getMongoQueryFromGPT(userQuery);
      console.log("🧠 GPT-Generated Mongo Operation:", mongoOp);
  
      const result = await executeMongoQuery(mongoOp);
      res.json({ mongo: mongoOp, data: result });
  
    } catch (err) {
      console.error("❌ MongoDB NLI Error:", err);  // <-- full error object
      res.status(500).json({ error: "Failed to process MongoDB query." });
    }
});
  

module.exports = router;
