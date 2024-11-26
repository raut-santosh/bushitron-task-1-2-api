const { generateToken } = require('../lib/utils');
const User = require('../models/user.model')
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({ fullName, email, password: hashedPassword });
        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json({ message: 'User created successfully', _id: newUser._id, fullName: newUser.fullName, email: newUser.email, profilePic: newUser.profilePic, role: newUser.role });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        generateToken(user._id, res)
        res.status(200).json({ message: 'Logged in successfully', _id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic, role: user.role })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' })
    }
}

exports.logout = (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 })
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('Server error: ', error)
        res.status(500).json({ message: 'Server error: ' })
    }
}

exports.updateProfilePic = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!req.file) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }
        const profilePicUrl = `/uploads/${req.file.filename}`
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: profilePicUrl },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile Pic updated successfully',
            fullName: updatedUser.fullName,
            profilePic: updatedUser.profilePic,
            role: updatedUser.role,
            _id: updatedUser._id,
            email: updatedUser.email,
        });

    } catch (error) {
        console.log('Server error: ', error)
        res.status(500).json({ message: 'Server error: ' })
    }
}

exports.updateProfile = async (req, res) => {
    const { fullName, email } = req.body
    try {
        const role = req.user.role;
        if(role !== 'Admin'){
            return res.status(403).json({ message: 'Only admin can update the profile' });  
        }

        const userId = req.user._id;
        if(!fullName || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, email },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            fullName: updatedUser.fullName,
            profilePic: updatedUser.profilePic,
            role: updatedUser.role,
            _id: updatedUser._id,
            email: updatedUser.email,
        })
    } catch (error) {
        console.log('Server error: ', error)
        res.status(500).json({ message: 'Server error: ', error })
    }
}