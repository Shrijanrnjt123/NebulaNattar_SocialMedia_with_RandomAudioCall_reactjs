import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Posts } from "../modules/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const imagePath = req.file ? req.file.path : null;
  if (
    [caption].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  console.log(imagePath);

  const postRes = await Posts.create({
    userid: req.user._id,
    name: req.user.fullName,
    caption,
    images: imagePath
  });

  if (!postRes) {
    throw new ApiError(500, "Something went wrong while posting");
  }

  const apiResponse = new ApiResponse(200, postRes, "Post uploaded successfully");
  return res.status(apiResponse.statusCode).json(apiResponse);
});



const getPaginatedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }
    };

    const data = await Posts.paginate({}, options);
    const apiResponse = new ApiResponse(200, data, "Results fetched Successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(400, "No posts found")
  }
};

const getMyPosts = async (req, res) => {
  const userid = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }
    };

    const query = { userid };

    const data = await Posts.paginate(query, options);
    const apiResponse = new ApiResponse(200, data, "Results fetched successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(500, "Something went wrong while fetching")
  }
};


const updatePostCaption = async (req, res) => {
  const userid = req.user._id; // Ensure req.user is populated
  const { postId, newCaption } = req.body; // Assuming postId and newCaption are sent in the request body

  try {
    const post = await Posts.findOne({ _id: postId, userid });

    if (!post) {
      throw new ApiError(404, "Post not found or you do not have permission to edit this post");
    }

    post.caption = newCaption;
    await post.save();

    const apiResponse = new ApiResponse(200, post, "Caption updated successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    const apiError = new ApiError(400, err.message || "Error updating caption");
    return res.status(apiError.statusCode).json(apiError);
  }
};



const deletePost = async (req, res) => {
  const userid = req.user._id;
  const { postId } = req.body;

  try {
    const post = await Posts.findOneAndDelete({ _id: postId, userid });

    if (!post) {
      throw new ApiError(404, "Post not found or you do not have permission to delete this post");
    }

    const apiResponse = new ApiResponse(200, post, "Post deleted successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(500, "Error deleting post")
  }
};



const reportPost = async (req, res) => {
  const userid = req.user._id;
  const { postId } = req.body;

  try {
    const post = await Posts.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }


    if (!post.reports.includes(userid)) {
      post.reports.push(userid);
      if (post.reports.length > 10) {
        post.postStatus = "disable";
      }
      await post.save();
    }

    const apiResponse = new ApiResponse(200, post, "Post reported successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(500, "Error reporting post")
  }
};

const savePost = async (req, res) => {
  const userid = req.user._id;
  const { postId } = req.body;

  try {
    const post = await Posts.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (!post.saved.includes(userid)) {
      post.saved.push(userid);
      await post.save();
    }

    const apiResponse = new ApiResponse(200, post, "Post saved successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(500, "Error saving post")
  }
};


const getSavedPosts = async (req, res) => {
  const userid = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }
    };

    const query = { saved: userid };

    const data = await Posts.paginate(query, options);
    const apiResponse = new ApiResponse(200, data, "Saved posts fetched successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    throw new ApiError(500, "Error fetching saved post")
  }
};


const addComment = async (req, res) => {
  const userid = req.user._id;
  const name = req.user.fullName;
  const { postId, text } = req.body;

  try {
    const post = await Posts.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const newComment = {
      user: userid,
      name,
      postId,
      text
    };

    post.comments.push(newComment);
    await post.save();

    const apiResponse = new ApiResponse(200, post, "Comment added successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    const apiError = new ApiError(400, err.message || "Error adding comment");
    return res.status(apiError.statusCode).json(apiError);
  }
};


const addReply = async (req, res) => {
  const userid = req.user._id;
  const name = req.user.fullName;
  const { postId, commentId, text } = req.body;

  try {
    const post = await Posts.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = post.comments.find(comment => comment._id.toString() === commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    const newReply = {
      user: userid,
      text: text,
      name
    };

    comment.replies.push(newReply);
    await post.save();

    const apiResponse = new ApiResponse(200, post, "Reply added successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    const apiError = new ApiError(400, err.message || "Error adding reply");
    return res.status(apiError.statusCode).json(apiError);
  }
};


const getCommentsAndReplies = async (req, res) => {
  const { postId } = req.body;

  try {
    const post = await Posts.find(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const commentsWithReplies = post.comments.map(comment => {
      return {
        _id: comment._id,
        user: comment.user,
        name: comment.name,
        postId: comment.postId,
        text: comment.text,
        createdAt: comment.createdAt,
        replies: comment.replies
      };
    });

    const apiResponse = new ApiResponse(200, commentsWithReplies, "Comments and replies fetched successfully");
    return res.status(apiResponse.statusCode).json(apiResponse);
  } catch (err) {
    const apiError = new ApiError(400, err.message || "Error fetching comments and replies");
    return res.status(apiError.statusCode).json(apiError);
  }
};

export {
  createPost,
  getMyPosts,
  getPaginatedPosts,
  updatePostCaption,
  deletePost,
  reportPost,
  savePost,
  getSavedPosts,
  addComment,
  addReply,
  getCommentsAndReplies


}