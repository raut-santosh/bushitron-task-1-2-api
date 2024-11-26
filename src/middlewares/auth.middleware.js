const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ message: 'Access denied' });
        }

        const user = await User.findById(verified.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: 'Access denied' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.checkRole = (roles) => {
    return (req, res, next) => {
      try {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied. Only Admin Can Edit Profile.' });
        }
        next(); 
      } catch (error) {
        console.error('Role checking middleware error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    };
  };
  