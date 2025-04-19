# Imports
import mysql.connector
import sys
import sqlalchemy
import pymysql
pymysql.install_as_MySQLdb()
import pandas as pd
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

    prompt = f"""
    You are a helpful assistant that converts natural language into SQL or MongoDB queries.

    This question is about a relational database, so return ONLY a SQL query. Return the query
    EXACTLY how it would be input in SQL.

    Here are the specs of the database: {training_data}

    User Input: "{nl_input}"
    Output:
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    query = response['choices'][0]['message']['content'].strip()
    query = query[7:-4]
    return query

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
    No need to explain the rules of baseball.
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
        print("Invalid Query. Try again.")

def execute_mongodb_query(query):
    for doc in mlb_tiktok.find().limit(5):
        print("MongoDB Document:", doc)

val = ''
while val != 'e':
    # TODO Use Web UI input in this spot
    val = input("Input the database you would like to use: Season Stats (s), Finance (f), Social Media (m), Exit (e): ")
    if val == 's':
        user_input = input("\nAsk your question: ")

        query = get_sql_query_from_gpt(user_input, "season-stats")
        result = execute_rdbms_query(mlb_season_stats, query)
        explanation = explain_result_with_gpt(query, result)
        print(explanation)
    elif val == 'f':
        user_input = input("\nAsk your question: ")

        query = get_sql_query_from_gpt(user_input, "finance-stats")
        result = execute_rdbms_query(mlb_finance_stats, query)
        explanation = explain_result_with_gpt(query, result)
        print(explanation)
    elif val == 'm':
        # TODO Obtain query from LLM
        query = input("Enter your query: ")
        execute_mongodb_query(query)
    elif val != 'e':
        print("Invalid input. Try again.")

mlb_season_stats.close()
mlb_season_stats_conn.close()
mlb_finance_stats.close()
mlb_finance_stats_conn.close()
mongo_client.close()