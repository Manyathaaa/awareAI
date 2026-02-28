import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, department });
    const token = signToken(user._id);

    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('badges')
      .populate('trainingsCompleted');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/auth/me
export const updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'department'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
