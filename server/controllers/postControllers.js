const Post = require('../models/postModel')
const User = require('../models/userModel')
const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')
const HttpError = require('../models/errorModel')




// ======================== CREATE POST
//POST : api/posts
//PROTECTED
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;

        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumbnail.", 422))
        }

        const { thumbnail } = req.files;
        //check the file size
        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File should be less than 2mb", 422))
        }

        let fileName = thumbnail.name;
        let splittedFilename = fileName.split('.')
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err))
            } else {
                const newPost = await Post.create({ title, category, description, thumbnail: newFilename, creator: req.user.id })
                if (!newPost) {
                    return next(new HttpError("Post couldn't be created", 422))
                }
                //find user and increate post by 1
                const currentUser = await User.findById(req.user.id)
                const userPostCount = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })

                res.status(200).json(newPost)
            }
        })

    } catch (error) {
        return next(new HttpError(error))
    }
}



// ======================== Get all POST
//gET : api/posts
//PROTECTED
const getPosts = async (req, res, next) => {
    try {
      const startIndex = parseInt(req.query.startIndex, 10) || 0;
      const limit = parseInt(req.query.limit, 10) || 9;
      const sortDirection = req.query.sort === 'asc' ? 1 : -1; // Sửa từ 'order' thành 'sort'
      
      const filter = {
        ...(req.query.userId && { userId: req.query.userId }),
        ...(req.query.category && { category: req.query.category }),
        ...(req.query.slug && { slug: req.query.slug }),
        ...(req.query.postId && { _id: req.query.postId }),
        ...(req.query.searchTerm && {
          $or: [
            { title: { $regex: req.query.searchTerm, $options: 'i' } },
            { content: { $regex: req.query.searchTerm, $options: 'i' } },
          ],
        }),
      };
  

  
      const posts = await Post.find(filter)
        .sort({ updatedAt: sortDirection })
        .skip(startIndex)
        .limit(limit);
  
      const totalPosts = await Post.countDocuments(filter);
  
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastMonthPosts = await Post.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
  
      res.status(200).json({
        posts,
        totalPosts,
        lastMonthPosts,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      next(new HttpError('Failed to fetch posts', 500));
    }
  };
  
  
  



// ======================== get single POST
//GET : api/posts/:id
//PROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return next(new HttpError("Post not found.", 404))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ======================== CREATE POST By CATEGORY
//GET : api/posts/categories/:category
//PROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createAt: -1 })
        res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ======================== GET USER/AUTHOR POST
//GET : api/posts/users/:id
//PROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createAt: -1 })
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ======================== EDIT POST
//PATCH : api/posts/:id
//PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFilename;
        let updatePost;
        let postId = req.params.id;
        let { title, category, description } = req.body;
        //React quill has a paragraph opening and closing tag with a break tag in between so there are 11 character in there already
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all fields.", 422))
        }
        //get old post from database
        const oldPost = await Post.findById(postId);
        if (req.user.id == oldPost.creator) {
            if (!req.files) {
                updatePost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true })
            } else {

                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }

                })
                //upload new thumbnail
                const { thumbnail } = req.files;

                //check thumbnail size
                if (thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 2mb"))
                }

                fileName = thumbnail.name;
                let splittedFilename = fileName.split('.')
                newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }
                })

                updatePost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename }, { new: true })
            }
        }

        if (!updatePost) {
            return next(new HttpError("Couldn't update post", 400))
        }

        res.status(200).json(updatePost)

    } catch (error) {
        return next(new HttpError(error))
    }
}




// ======================== DELETE POST
//DELETE : api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
    try {

        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post unavailable.", 400))
        }

        const post = await Post.findById(postId);
        const fileName = post?.thumbnail;


        if (req.user.id || rep.user.isAdmin == post.creator) {

            //delete thumbnail from uploads folder
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                } else {
                    await Post.findByIdAndDelete(postId);
                    //find user and reduce post count by
                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser?.posts - 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })
                    res.json(`Post ${postId} delete successfully`)
                }
            })
        } else {
            return next(new HttpError("Post couldn't be deleted.", 403))
        }

    } catch (error) {
        return next(new HttpError(error))
    }
}





module.exports = { createPost, getPost, getPosts, getCatPosts, getUserPosts, editPost, deletePost }