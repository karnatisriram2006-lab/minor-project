const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    // Account lockout after brute-force attempts
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
        default: null,
    },
    interests: {
        type: [String],
        default: [],
    },
    nationality: {
        type: String,
        default: 'Not Specified',
    },
    language: {
        type: String,
        default: 'English',
    },
    avatar: {
        type: String,
        default: null, // Will fallback to gradient hash on frontend
    },
    bio: {
        type: String,
        maxlength: 160,
        default: '',
    },
    savedTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SavedTrip'
    }],
    bookmarkedTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }],
}, { timestamps: true });

// Virtual: is account currently locked?
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Increment failed login attempts, lock after 5 failures for 30 minutes
userSchema.methods.incrementLoginAttempts = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

    if (this.lockUntil && this.lockUntil < Date.now()) {
        // Lock has expired - reset
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
        updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION) };
    }
    return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

// Encrypt password using bcrypt before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
