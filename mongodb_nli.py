##This code converts NLI queries to SQL
import openai
import pymongo
import os

# CONFIGURING OPENAI

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY") 

# MongoDB connection URI and database/collection names
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "your_database"
#COLLECTION_NAME = "your_collection"

# Converting Query to mongoDB
def get_mongo_query_from_gpt(natural_language_query):
    """
    Sends a natural language query to OpenAI and gets a MongoDB query.
    """
    schema_description = """
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

2. Collection: 'mlb_instagram'
Each document represents a social media post made by a sports team on Instagram:
- author: string — the Instagram handle (e.g. "@dbacks")
- media: string — always "instagram"
- caption: string
- date: string — in MM-DD-YY format (e.g. "08-28-24")
- likes: integer
- link: string — URL to the post
- tagged: array of strings — tagged accounts
- team name: string — maps to 'social_media.team'

3. Collection: 'mlb_x'
Each document represents a post made on X (formerly Twitter):
- author: string — X handle (e.g. "dbacks")
- media: string — always "x"
- caption: string
- date: string — MM-DD-YY
- likes: integer
- link: string — URL to the post
- tagged: array of strings
- team name: string — maps to 'social_media.team'

4. Collection: 'mlb_tiktok'
Each document represents a TikTok post:
- author: string — TikTok handle
- media: string — always "tiktok"
- caption: string
- date: string — MM-DD-YY
- likes: integer
- link: string
- tagged: array of strings
- team name: string — maps to 'social_media.team'
"""

    system_prompt = f"""
You are a MongoDB assistant. Your job is to convert natural language commands into valid MongoDB operations.

You support:
- find queries with optional projection
- aggregate queries using: $match, $group, $sort, $limit, $skip, $project
- $match can appear before or after $group
- $lookup for joining collections
- data modification with: insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany

The database has the following collections and fields:
{schema_description}

Always return a single JSON object like this:

For `find`:
{{ "operation": "find", "collection": "collection_name", "filter": {{ ... }}, "projection": {{ ... }} }}

For `aggregate`:
{{ "operation": "aggregate", "collection": "collection_name", "pipeline": [ ... ] }}

For joins with $lookup:
{{ "operation": "lookup_query", "collection": "collection_name", "pipeline": [ ... ] }}

For insert:
{{ "operation": "insertOne", "collection": "collection_name", "document": {{ ... }} }}

For update:
{{ "operation": "updateOne", "collection": "collection_name", "filter": {{ ... }}, "update": {{ ... }} }}

For delete:
{{ "operation": "deleteOne", "collection": "collection_name", "filter": {{ ... }} }}

Only return the JSON. Do not include any explanation or extra text.
"""

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": natural_language_query}
        ],
        temperature=0
    )

    mongo_query = response['choices'][0]['message']['content'].strip()
    return mongo_query


#Executing Mongo Query in MongoDB

def execute_mongo_query(operation_obj):
    """
    Executes the MongoDB operation based on the operation details provided by GPT.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Convert string response into dictionary
    if isinstance(operation_obj, str):
        operation_obj = eval(operation_obj)
    
    try:
        collection = db[operation_obj["collection"]]

        if operation_obj["operation"] == "find":
            # Execute a find operation with filter and projection
            results = list(collection.find(operation_obj.get("filter", {}), operation_obj.get("projection", {})))
            return results

        elif operation_obj["operation"] == "aggregate":
            # Execute an aggregate operation
            results = list(collection.aggregate(operation_obj["pipeline"]))
            return results

        elif operation_obj["operation"] == "insertOne":
            # Execute an insertOne operation
            result = collection.insert_one(operation_obj["document"])
            return f"Inserted with _id: {result.inserted_id}"

        elif operation_obj["operation"] == "insertMany":
            # Execute an insertMany operation
            result = collection.insert_many(operation_obj["documents"])
            return f"Inserted with _ids: {result.inserted_ids}"

        elif operation_obj["operation"] == "updateOne":
            # Execute an updateOne operation
            result = collection.update_one(operation_obj["filter"], operation_obj["update"])
            return f"Modified {result.modified_count} document(s)"

        elif operation_obj["operation"] == "updateMany":
            # Execute an updateMany operation
            result = collection.update_many(operation_obj["filter"], operation_obj["update"])
            return f"Modified {result.modified_count} document(s)"

        elif operation_obj["operation"] == "deleteOne":
            # Execute a deleteOne operation
            result = collection.delete_one(operation_obj["filter"])
            return f"Deleted {result.deleted_count} document(s)"

        elif operation_obj["operation"] == "deleteMany":
            # Execute a deleteMany operation
            result = collection.delete_many(operation_obj["filter"])
            return f"Deleted {result.deleted_count} document(s)"

        else:
            return " Unsupported operation."

    except Exception as e:
        return f" Error executing operation: {str(e)}"

# --- MAIN LOOP ---

def handle_query(nl_query):
    mongo_query = get_mongo_query_from_gpt(nl_query)
    result = execute_mongo_query(mongo_query)
    #We can combine this with your explain_result_with_gpt
    return result

