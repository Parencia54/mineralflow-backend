require('dotenv').config({ path: __dirname + '/.env' });

console.log("ENV FILE LOADED");
console.log("MONGO_URI VALUE:", process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;
console.log("Mongo URI:", process.env.MONGO_URI);

mongoose.connect(MONGO)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.log("Mongo error:", err));

app.get("/", (req, res) => {
  res.send("MineralFlow backend running");
});

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/users', userRoutes);
