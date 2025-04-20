# Imports
import mysql.connector
from pymongo import MongoClient
from dotenv import load_dotenv
import openai
import os

load_dotenv()  # Load variables from .env
openai.api_key = os.getenv("OPENAI_API_KEY")

# INITIALIZE CONNECTIONS
mlb_season_stats_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="mlb_season_stats"
)
mlb_season_stats = mlb_season_stats_conn.cursor()

mlb_finance_stats_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="mlb_finance_stats"
)
mlb_finance_stats = mlb_finance_stats_conn.cursor()

mongo_client = MongoClient("mongodb://localhost:27017/")
mlb_social_media = mongo_client["mlb_social_media"]
mlb_instagram = mlb_social_media["mlb_instagram"]
mlb_tiktok = mlb_social_media["mlb_tiktok"]
mlb_x = mlb_social_media["mlb_x"]
social_media = mlb_social_media["social_media"]
social_posts = mlb_social_media["social_posts"]

def get_sql_query_from_gpt(nl_input, db):
    text_file_path = ''
    if db == "season-stats":
        text_file_path = './rdbms/mlb-season-stats/season-stats-specs.txt'
    elif db == 'finance-stats':
        text_file_path = './rdbms/mlb-finance-stats/finance-stats-specs.txt'

    training_data = ''
    with open(text_file_path, 'r') as file:
        training_data = file.read()

    system_prompt = f"""
    You are a helpful assistant that converts natural language into SQL queries.

    This question is about a relational database, so return ONLY a SQL query. Return the query
    EXACTLY how it would be input in SQL.

    Here are the specs of the database: {training_data}

    User Input: "{nl_input}"
    Output:
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": system_prompt}],
        temperature=0.3
    )
    query = response['choices'][0]['message']['content'].strip()
    query = query[7:-4]
    return query

def get_mongodb_query_from_gpt(nl_input):
    text_file_path = './dsci551_mongodb/social-stats-specs.txt'
    training_data = ''
    with open(text_file_path, 'r') as file:
        training_data = file.read()

    system_prompt = f"""
    You are a MongoDB assistant. Your job is to convert natural language commands into valid MongoDB operations.

    You support:
    - find queries with optional projection
    - aggregate queries using: $match, $group, $sort, $limit, $skip, $project
    - $match can appear before or after $group
    - $lookup for joining collections
    - data modification with: insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany

    The database has the following collections and fields:
    {training_data}

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
            {"role": "user", "content": nl_input}
        ],
        temperature=0
    )

    mongo_query = response['choices'][0]['message']['content'].strip()
    return mongo_query

def explain_result_with_gpt(query, result):
    # Convert result to string if it's not already
    if isinstance(result, list):
        result_str = "\n".join([str(row) for row in result])
    else:
        result_str = str(result)

    prompt = f"""
    You are a helpful assistant. A user asked a database question and you generated the following query:

    Query:
    {query}

    The query was run and returned the following results:
    {result_str}

    Now, explain the results in natural language. Use as few technical terms as possible, and keep it simple.
    Do not reference the query or the database, just print the result. Instead of saying "the result shows X", just say "X".
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response['choices'][0]['message']['content'].strip()


def execute_rdbms_query(db, query):
    try:
        db.execute(query)
        result = db.fetchall()
        return result
    except:
        print("Query returned no response.")

def execute_mongodb_query(operation_obj):
    """
    Executes the MongoDB operation based on the operation details provided by GPT.
    """
    
    # Convert string response into dictionary
    if isinstance(operation_obj, str):
        operation_obj = eval(operation_obj)
    
    try:
        collection = mlb_social_media[operation_obj["collection"]]
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

val = ''
while val != 'e':
    query = ''
    # TODO Use Web UI input in this spot
    val = input("Input the database you would like to use: Season Stats (s), Finance (f), Social Media (m), Exit (e): ")
    if val == 's':
        user_input = input("\nAsk your question, or go back (b): ")
        if user_input == 'b':
            continue

        query = get_sql_query_from_gpt(user_input, "season-stats")
        result = execute_rdbms_query(mlb_season_stats, query)
        explanation = explain_result_with_gpt(query, result)
        print(explanation)
    elif val == 'f':
        user_input = input("\nAsk your question, or go back (b): ")
        if user_input == 'b':
            continue

        query = get_sql_query_from_gpt(user_input, "finance-stats")
        result = execute_rdbms_query(mlb_finance_stats, query)
        explanation = explain_result_with_gpt(query, result)
        print(explanation)
    elif val == 'm':
        user_input = input("\nAsk your question, or go back (b): ")
        if user_input == 'b':
            continue

        query = get_mongodb_query_from_gpt(user_input)
        result = execute_mongodb_query(query)
        explanation = explain_result_with_gpt(query, result)
        print(explanation)
    elif val != 'e':
        print("Invalid input. Try again.")

mlb_season_stats.close()
mlb_season_stats_conn.close()
mlb_finance_stats.close()
mlb_finance_stats_conn.close()
mongo_client.close()