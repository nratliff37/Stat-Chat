# StatChat

StatChat is a full-stack web application that allows users to query Major League Baseball (MLB) data using natural language. It supports both SQL and MongoDB backends and uses OpenAI's GPT-4o model to convert natural language into executable queries.

---

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software

* Node.js (v18+ recommended) — [https://nodejs.org/](https://nodejs.org/)
* npm — [https://www.npmjs.com/](https://www.npmjs.com/)
* MongoDB CLI tools (optional, for importing data) — [https://www.mongodb.com/docs/database-tools/mongoimport/](https://www.mongodb.com/docs/database-tools/mongoimport/)
* MySQL Workbench (optional, for local MySQL access) — [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)

### Required API Keys and Environment Variables

Create a `.env` file inside the `backend/` directory with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
MONGO_URI=your_mongo_connection_string
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=your_mysql_database_name
MYSQL_PORT=your_mysql_port
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stat-chat.git
cd stat-chat
```

### 2. Install Dependencies

```bash
cd backend
npm install
cd ..
npm install
```

### 3. Set Up Databases

**For MySQL**:

* Create the `railway` database (or your custom name).
* Run the SQL schema setup scripts (located in the rdbms folders) to create `season_stats_batter`, `season_stats_pitcher`, and `team_finance`.

**For MongoDB** (hosted on Railway or Atlas):

To import JSON data into each MongoDB collection:

```bash
mongoimport \
--uri="your_mongo_connection_string" \
--collection=social_media \
--file=path/to/social_media.json \
--jsonArray

mongoimport \
--uri="your_mongo_connection_string" \
--collection=instagram \
--file=path/to/instagram.json \
--jsonArray

mongoimport \
--uri="your_mongo_connection_string" \
--collection=x \
--file=path/to/x.json \
--jsonArray

mongoimport \
--uri="your_mongo_connection_string" \
--collection=tiktok \
--file=path/to/tiktok.json \
--jsonArray
```

> Replace `path/to/...` with the actual file paths to your JSON files.

---

### 4. Run the Backend Server

```bash
cd backend
npm run dev
```

This starts the backend at `http://localhost:3001`.

### 5. Run the Frontend Application

```bash
cd ..
npm start
```

This starts the frontend React app at `http://localhost:3000`.

---

### Tip for Python Virtual Environment Setup

When cloning the repo, you can run:

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

You're now ready to use StatChat! Try entering questions like:

* "Who hit the most home runs?"
* "Add a new Instagram post by the Yankees with 100000 likes."
* "Which team has the most followers on TikTok?"
