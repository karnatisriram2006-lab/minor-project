const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Send a connection request
// @route   POST /api/connections/request/:uid
// @access  Private
exports.sendRequest = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        const recipientUid = recipientId;
        const requesterUid = req.user.firebaseUid;

        if (recipientUid === requesterUid) {
            return res.status(400).json({ message: "You cannot connect with yourself." });
        }

        // Check if connection already exists
        const existing = await Connection.findOne({
            $or: [
                { requester: requesterUid, recipient: recipientUid },
                { requester: recipientUid, recipient: requesterUid }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "A connection or request already exists between you." });
        }

        const newRequest = await Connection.create({
            requester: requesterUid,
            recipient: recipientUid,
            status: 'pending'
        });

        res.status(201).json({
            message: "Connection request sent successfully.",
            request: newRequest
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user's connections
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res, next) => {
    try {
        const uid = req.user.firebaseUid;
        
        // Find all accepted connections where user is either requester or recipient
        const connections = await Connection.find({
            $or: [{ requester: uid }, { recipient: uid }],
            status: 'accepted'
        });

        // Get the UIDs of the people connected to
        const otherUids = connections.map(conn => 
            conn.requester === uid ? conn.recipient : conn.requester
        );

        // Fetch their user details
        const connectedUsers = await User.find({ firebaseUid: { $in: otherUids } })
            .select('name firebaseUid email avatar bio interests');

        res.json(connectedUsers);
    } catch (err) {
        next(err);
    }
};

// @desc    Get pending incoming requests
// @route   GET /api/connections/pending
// @access  Private
exports.getPendingRequests = async (req, res, next) => {
    try {
        const uid = req.user.firebaseUid;
        
        // Find pending requests where current user is the recipient
        const pending = await Connection.find({
            recipient: uid,
            status: 'pending'
        }).sort({ createdAt: -1 });

        // Get requester UIDs
        const requesterUids = pending.map(p => p.requester);

        // Fetch user details for requesters
        const requesters = await User.find({ firebaseUid: { $in: requesterUids } })
            .select('name firebaseUid avatar bio interests nationality');

        // Map back to include the connection ID
        const result = pending.map(p => {
            const userData = requesters.find(r => r.firebaseUid === p.requester);
            return {
                _id: p._id,
                status: p.status,
                createdAt: p.createdAt,
                requester: userData || { firebaseUid: p.requester, name: 'Unknown User' }
            };
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
};

// @desc    Respond to a connection request
// @route   PUT /api/connections/respond
// @access  Private
exports.respondToRequest = async (req, res, next) => {
    try {
        const { requestId, action } = req.body; // action: 'accepted' or 'declined'
        const uid = req.user.firebaseUid;

        const connection = await Connection.findById(requestId);

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found." });
        }

        // Verify that the current user is the recipient
        if (connection.recipient !== uid) {
            return res.status(403).json({ message: "You are not authorized to respond to this request." });
        }

        if (action === 'accepted') {
            connection.status = 'accepted';
            await connection.save();
            return res.json({ message: "Connection request accepted!", status: 'accepted' });
        } else if (action === 'declined') {
            await Connection.findByIdAndDelete(requestId);
            return res.json({ message: "Connection request declined.", status: 'declined' });
        } else {
            return res.status(400).json({ message: "Invalid action. Use 'accepted' or 'declined'." });
        }
    } catch (err) {
        next(err);
    }
};
