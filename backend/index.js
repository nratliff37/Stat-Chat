const express = require('express');
const cors = require('cors');
require('dotenv').config();

const queryRoute = require('./routes/query');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// All SQL generation + query logic
app.use('/api/generate-sql', queryRoute);

// All MongoDB generation + query logic
const mongoRoute = require('./routes/mongo');
app.use('/api/generate-mongo', mongoRoute);


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
