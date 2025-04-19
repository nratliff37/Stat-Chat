# Imports
import mysql.connector
import sys
import sqlalchemy
import pymysql
pymysql.install_as_MySQLdb()
import pandas as pd
from pymongo import MongoClient

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

def execute_rdbms_query(db, query):
    try:
        db.execute(query)
        for row in db.fetchall():
            print("MySQL Row:", row)
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
        # TODO Obtain query from LLM
        query = input("Enter your query: ")
        execute_rdbms_query(mlb_season_stats, query)
    elif val == 'f':
        # TODO Obtain query from LLM
        query = input("Enter your query: ")
        execute_rdbms_query(mlb_finance_stats, query)
    elif val == 'm':
        # TODO Obtain query from LLM
        query = input("Enter your query: ")
        execute_mongodb_query(query)
    elif val != 'e':
        print("Invalid input. Try again.")

mlb_season_stats.close()
mlb_season_stats_conn.close()
mongo_client.close()