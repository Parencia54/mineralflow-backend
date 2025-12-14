const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Company = require('../models/Company');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// --- REGISTER COMPANY ADMIN (only for approved company) ---
router.post('/register', async (req, res) => {
  const { name, email, password, companyId, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if(existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      company: companyId
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });

  } catch(err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('company');
    if(!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      company: user.company._id
    }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, role: user.role, company: user.company.name } });

  } catch(err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
