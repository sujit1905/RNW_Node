const express = require('express');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (accept images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: fileFilter
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Get all posts (Homepage)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;
        const category = req.query.category || '';
        const search = req.query.search || '';

        let query = { status: 'published' };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        const totalPosts = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('author', 'username profileImage firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalPosts / limit);
        const categories = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other'];

        res.render('blog/index', {
            title: 'Blog',
            posts,
            categories,
            currentPage: page,
            totalPages,
            category,
            search
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load posts'
        });
    }
});

// Get single post
router.get('/post/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('author', 'username profileImage firstName lastName bio')
            .populate('comments.author', 'username profileImage firstName lastName');

        if (!post) {
            return res.status(404).render('404', { title: 'Post Not Found' });
        }

        // Increment views
        post.views++;
        await post.save();

        // Get related posts
        const relatedPosts = await Post.find({
            category: post.category,
            _id: { $ne: post._id },
            status: 'published'
        })
            .populate('author', 'username')
            .limit(3)
            .sort({ views: -1 });

        res.render('blog/post', {
            title: post.title,
            post,
            relatedPosts,
            isLiked: req.user ? post.isLikedBy(req.user._id) : false
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load post'
        });
    }
});

// Create post page
router.get('/create', isAuthenticated, (req, res) => {
    res.render('blog/create', {
        title: 'Create Post',
        categories: ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other']
    });
});

// Create post
router.post('/create', isAuthenticated, upload.single('featuredImage'), async (req, res) => {
    try {
        const { title, content, excerpt, category } = req.body;

        if (!title || !content) {
            return res.render('blog/create', {
                title: 'Create Post',
                error: 'Title and content are required',
                categories: ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other']
            });
        }

        const post = new Post({
            title,
            content,
            excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
            category: category || 'General',
            featuredImage: req.file ? `/uploads/${req.file.filename}` : '/images/default-post.png',
            author: req.user._id
        });

        await post.save();

        res.redirect(`/blog/post/${post.slug}`);
    } catch (err) {
        console.error(err);
        res.render('blog/create', {
            title: 'Create Post',
            error: err.message || 'Failed to create post',
            categories: ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other']
        });
    }
});

// Edit post page
router.get('/edit/:slug', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).render('404', { title: 'Post Not Found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', { 
                title: 'Error',
                message: 'You are not authorized to edit this post'
            });
        }

        res.render('blog/edit', {
            title: 'Edit Post',
            post,
            categories: ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other']
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load post'
        });
    }
});

// Update post
router.post('/edit/:slug', isAuthenticated, upload.single('featuredImage'), async (req, res) => {
    try {
        let post = await Post.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).render('404', { title: 'Post Not Found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', { 
                title: 'Error',
                message: 'You are not authorized to edit this post'
            });
        }

        const { title, content, excerpt, category, status } = req.body;

        const updateData = { 
            title, 
            content, 
            excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200), 
            category,
            status,
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.featuredImage = `/uploads/${req.file.filename}`;
        }

        post = await Post.findByIdAndUpdate(
            post._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.redirect(`/blog/post/${post.slug}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            title: 'Error',
            message: err.message || 'Failed to update post'
        });
    }
});

// Delete post
router.post('/delete/:slug', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Post.findByIdAndDelete(post._id);

        res.redirect('/blog');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Like post
router.post('/like/:slug', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();

        res.json({ 
            likeCount: post.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Add comment
router.post('/comment/:slug', isAuthenticated, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Comment cannot be empty' });
        }

        const post = await Post.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments.push({
            author: req.user._id,
            text: text.trim()
        });

        await post.save();

        await post.populate('comments.author', 'username profileImage firstName lastName');

        res.json({ 
            comment: post.comments[post.comments.length - 1],
            commentCount: post.comments.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// My posts
router.get('/my-posts', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 });

        res.render('blog/my-posts', {
            title: 'My Posts',
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load posts'
        });
    }
});

module.exports = router;