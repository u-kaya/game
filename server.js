// Set up the Express server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Open the database
const db = new sqlite3.Database('./quiz.db', (err) => {
    if (err) {
        console.error('Could not open database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


// Create the table if it does not exist
db.run(`
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        minEstimate INTEGER,
        maxEstimate INTEGER,
        isCorrect BOOLEAN
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Table 'answers' is ready.");
    }
});

// Handle POST request to /save-answer
app.post("/save-answer", (req, res) => {
    const { question, minEstimate, maxEstimate, isCorrect } = req.body;

    // Log the received data for debugging
    console.log('Received:', req.body);

    // Insert into the database
    db.run(
        `INSERT INTO answers (question, minEstimate, maxEstimate, isCorrect) VALUES (?, ?, ?, ?)`,
        [question, minEstimate, maxEstimate, isCorrect],
        function (err) {
            if (err) {
                console.error('DB Insert Error:', err.message);
                res.status(500).json({ error: 'Failed to save answer' });
            } else {
                console.log('Answer saved with ID:', this.lastID); // Debug log
                res.json({ success: true, id: this.lastID });
            }
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Route to get all answers from the database
app.get("/answers", (req, res) => {
    db.all("SELECT * FROM answers", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ answers: rows });
    });
});