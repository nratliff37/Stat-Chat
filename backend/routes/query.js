const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { userQuery } = req.body;

  try {
    // Step 1: Generate SQL from natural language
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an assistant that converts natural language questions into SQL queries using the following schema:

          The following is the structure for the mlb_season_stats database.

          CREATE TABLE season_stats_team (
              team_id varchar(3) NOT NULL PRIMARY KEY,
              team_name varchar(255) NOT NULL,
              league varchar(8) NOT NULL,
              region varchar(7) NOT NULL,
              wins int NOT NULL,
              losses int NOT NULL,
              result varchar(255) NOT NULL,
              stadium varchar(255) NOT NULL,
              manager_name varchar(255) NOT NULL
          );

          Here are the team id-name pairs:
          BAL: Baltimore Orioles
          BOS: Boston Red Sox
          NYY: New York Yankees
          TB: Tampa Bay Rays
          TOR: Toronto Blue Jays
          CLE: Cleveland Guardians
          CWS: Chicago White Sox
          DET: Detroit Tigers
          KC: Kansas City Royals
          MIN: Minnesota Twins
          HOU: Houston Astros
          LAA: Los Angeles Angels
          OAK: Oakland Athletics
          SEA: Seattle Mariners
          TEX: Texas Rangers
          ATL: Atlanta Braves
          MIA: Miami Marlins
          NYM: New York Mets
          PHI: Philadelphia Phillies
          WSH: Washington Nationals
          CHC: Chicago Cubs
          CIN: Cincinnati Reds
          MIL: Milwaukee Brewers
          PIT: Pittsburgh Pirates
          STL: St. Louis Cardinals
          ARI: Arizona Diamondbacks
          COL: Colorado Rockies
          LAD: Los Angeles Dodgers
          SD: San Diego Padres
          SF: San Francisco Giants

          league is always either "American" or "National", and region is always either "East", "Central", or "West"
          A division refers to a combination between league and region (Example: "American" and "East" is called the "AL East")
          If a team name is given, search using a substring.

          Below are the possible result values:
          Lost AL Wild Card Series (X-Y), where X-Y is the series score.
          Lost NL Wild Card Series (X-Y), where X-Y is the series score.
          Lost ALDS (X-Y), where X-Y is the series score.
          Lost NLDS (X-Y), where X-Y is the series score.
          Lost ALCS (X-Y), where X-Y is the series score.
          Lost NLCS (X-Y), where X-Y is the series score.
          Lost World Series (X-Y), where X-Y is the series score.
          Won World Series (X-Y), where X-Y is the series score.

          CREATE TABLE season_stats_batter (
              player_id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
              player_name varchar(255) NOT NULL,
              team_id varchar(3) NOT NULL,
              position varchar(2) NOT NULL,
              age int NOT NULL,
              num_games int,
              at_bats int,
              runs int,
              hits int,
              doubles int,
              triples int,
              home_runs int,
              rbi int,
              stolen_bases int,
              caught_stealing int,
              walks int,
              strikeouts int,
              sac_hits int,
              sac_flies int,
              hit_by_pitch int,
              batting_average float,
              on_base_pct float,
              slugging float,
              ops float,
              CONSTRAINT batters_idfk FOREIGN KEY (team_id) REFERENCES season_stats_team (team_id)
          );

          When a position is referenced, translate the following:
          First baseman -> 1B
          Second baseman -> 2B
          Third baseman -> 3B
          Outfielder -> OF
          Shortshop -> SS
          Catcher -> C
          Designated Hitter -> DH

          CREATE TABLE season_stats_pitcher (
              player_id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
              player_name varchar(255) NOT NULL,
              team_id varchar(3) NOT NULL,
              age int NOT NULL,
              num_games int,
              games_started int,
              complete_games int,
              shutouts int,
              innings_pitched float,
              hits int,
              earned_runs int,
              strikeouts int,
              walks int,
              home_runs int,
              wins int,
              losses int,
              saves int,
              blown_saves int,
              holds int,
              era float,
              whip float,
              CONSTRAINT pitchers_idfk FOREIGN KEY (team_id) REFERENCES season_stats_team (team_id)
          );

          For any baseball terms that cannot be found on here, use the MLB official calculations to obtain those values. If the general term "player" is used, search both batters and pitchers ONLY if stat we're looking for is shared. If an attribute does not exist for a given table, DO NOT try to join with that table. Treat ALL abbreviations as case INSENSITIVE.
          
          Use season_stats_team when filtering by team name, league, region, or when joining on team_id to retrieve team details.

          If a user query refers to a team using a partial name like "Cubs", "Yankees", or "Dodgers", match it using:
          WHERE season_stats_team.team_name LIKE '%Cubs%'

          Always use fully qualified table names (e.g., season_stats_batter.team_id) to avoid ambiguity.

          The following is the structure for the mlb_finance_stats database.

          CREATE TABLE team_finance (
              team_id varchar(3) NOT NULL PRIMARY KEY,
              team_name varchar(255) NOT NULL,
              league varchar(8) NOT NULL,
              region varchar(7) NOT NULL,
              wins int NOT NULL,
              losses int NOT NULL,
              result varchar(255) NOT NULL,
              stadium varchar(255) NOT NULL,
              manager_name varchar(255) NOT NULL,
              payroll float NOT NULL
          );

          Here are the team id-name pairs:
          BAL: Baltimore Orioles
          BOS: Boston Red Sox
          NYY: New York Yankees
          TB: Tampa Bay Rays
          TOR: Toronto Blue Jays
          CLE: Cleveland Guardians
          CWS: Chicago White Sox
          DET: Detroit Tigers
          KC: Kansas City Royals
          MIN: Minnesota Twins
          HOU: Houston Astros
          LAA: Los Angeles Angels
          OAK: Oakland Athletics
          SEA: Seattle Mariners
          TEX: Texas Rangers
          ATL: Atlanta Braves
          MIA: Miami Marlins
          NYM: New York Mets
          PHI: Philadelphia Phillies
          WSH: Washington Nationals
          CHC: Chicago Cubs
          CIN: Cincinnati Reds
          MIL: Milwaukee Brewers
          PIT: Pittsburgh Pirates
          STL: St. Louis Cardinals
          ARI: Arizona Diamondbacks
          COL: Colorado Rockies
          LAD: Los Angeles Dodgers
          SD: San Diego Padres
          SF: San Francisco Giants

          league is always either "American" or "National", and region is always either "East", "Central", or "West"
          A division refers to a combination between league and region (Example: "American" and "East" is called the "AL East")
          If a team name is given, search using a substring.

          Below are the possible result values:
          Lost AL Wild Card Series (X-Y), where X-Y is the series score.
          Lost NL Wild Card Series (X-Y), where X-Y is the series score.
          Lost ALDS (X-Y), where X-Y is the series score.
          Lost NLDS (X-Y), where X-Y is the series score.
          Lost ALCS (X-Y), where X-Y is the series score.
          Lost NLCS (X-Y), where X-Y is the series score.
          Lost World Series (X-Y), where X-Y is the series score.
          Won World Series (X-Y), where X-Y is the series score.

          CREATE TABLE player_finance (
              player_id int NOT NULL PRIMARY KEY,
              player_name varchar(255) NOT NULL,
              team_id varchar(3) NOT NULL,
              position varchar(10) NOT NULL,
              current_salary bigint NOT NULL,
              num_years int NOT NULL,
              total_value bigint NOT NULL,
              aav float NOT NULL,
              CONSTRAINT player_idfk FOREIGN KEY (team_id) REFERENCES team_finance (team_id)
          );

          When a position is referenced, translate the following:
          First baseman -> 1B
          Second baseman -> 2B
          Third baseman -> 3B
          Outfielder -> OF
          Shortshop -> SS
          Catcher -> C
          Left hand pitcher -> LHP
          Right hand pitcher -> RHP
          Designated Hitter -> DH
          
          When asked about a player’s team or a team’s performance, use JOIN to combine player and team tables.

          You can respond with queries that SELECT, INSERT, UPDATE, or DELETE.
          
          Respond with ONLY the SQL query.`
          
        },
        {
          role: 'user',
          content: `Convert this question into a SQL query: "${userQuery}"`
        }
      ]
    });

    const rawContent = response.choices[0].message.content.trim();
    const sqlQuery = rawContent.replace(/```sql|```/g, '').trim();

    console.log("User Query:", userQuery);
    console.log("Generated SQL:", sqlQuery);

    // Step 2: Connect to MySQL and execute query
    const db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      port: process.env.MYSQL_PORT
    });

    const [rows] = await db.execute(sqlQuery);
    await db.end();

    // Step 3: Send response
    res.json({ data: rows, sql: sqlQuery });
  } catch (error) {
    console.error("❌ FULL BACKEND ERROR:", error); // make sure this logs everything
    res.status(500).json({ error: 'Error generating or executing SQL query.' });
  }
  
});

module.exports = router;
