const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Please provide content']
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        default: 'General',
        enum: ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other']
    },
    featuredImage: {
        type: String,
        default: '/images/default-post.png'
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate slug from title
postSchema.pre('save', function(next) {
    if (!this.isModified('title')) return next();
    
    this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    
    next();
});

// Generate excerpt from content
postSchema.pre('save', function(next) {
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 500).replace(/<[^>]*>/g, '');
    }
    next();
});

// Get like count
postSchema.methods.getLikeCount = function() {
    return this.likes.length;
};

// Get comment count
postSchema.methods.getCommentCount = function() {
    return this.comments.length;
};

// Check if user liked post
postSchema.methods.isLikedBy = function(userId) {
    return this.likes.includes(userId);
};

module.exports = mongoose.model('Post', postSchema);
