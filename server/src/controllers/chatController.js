import ChatMessage from '../models/ChatMessage.js';
import BloodRequest from '../models/BloodRequest.js';

// @desc    Get chat message history for an emergency request
// @route   GET /api/requests/:id/messages
// @access  Private
export const getRequestMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ requestId: req.params.id })
      .populate('senderId', 'fullName phone bloodGroup')
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching messages',
    });
  }
};

// @desc    Send a chat message for an emergency request
// @route   POST /api/requests/:id/messages
// @access  Private
export const sendRequestMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    const newMessage = await ChatMessage.create({
      requestId: request._id,
      senderId: req.user._id,
      message: message.trim(),
    });

    const populated = await ChatMessage.findById(newMessage._id).populate(
      'senderId',
      'fullName phone bloodGroup'
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`request:${request._id}`).emit('chat:message', populated);
    }

    return res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error sending message',
    });
  }
};

