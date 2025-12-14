const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Admin-only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        console.log('AdminOnly: req.user is undefined');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'company_admin') {
        console.log('AdminOnly: Access denied for role', req.user.role);
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
};

// DEBUG: log every incoming request to this router
router.use((req, res, next) => {
    console.log('Users Route Hit:', req.method, req.originalUrl);
    next();
});

// GET all employees in the admin's company
router.get('/', auth(), adminOnly, async (req, res) => {
    try {
        console.log('GET /api/users req.user:', req.user);

        const users = await User.find({ company: req.user.company }).select('-password');
        res.json(users);
    } catch (err) {
        console.log('GET /api/users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// CREATE a new employee (Admin-only)
router.post('/', auth(), adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            name,
            email,
            password,
            role: role || 'employee',
            company: req.user.company
        });

        await user.save();
        console.log('Created new user:', user);
        res.status(201).json({ message: 'Employee created successfully' });

    } catch (err) {
        console.log('POST /api/users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DEACTIVATE an employee (Admin-only)
router.patch('/:id/deactivate', auth(), adminOnly, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            company: req.user.company
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.active = false;
        await user.save();

        console.log('Deactivated user:', user._id);
        res.json({ message: 'Employee deactivated' });

    } catch (err) {
        console.log('PATCH /api/users/:id/deactivate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
