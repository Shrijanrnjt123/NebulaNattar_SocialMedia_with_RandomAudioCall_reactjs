import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/filehandeller.middleware.js";
import {
  createUser,
  loginUser,
  logoutUser,
  changeUserPassword,
  me
} from "../controllers/auth.controller.js";

import {
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
} from "../controllers/post.controller.js"

import { addVideo, getVideos } from '../controllers/video.controller.js';
import { verifyEmail } from "../controllers/email.controller.js";


const router = Router()


// non secure routes
router.route("/user/login").post(loginUser)
router.route("/user/register").post(createUser)

// Secured routes
router.route("/user/logout").post(verifyJWT, logoutUser)
router.route("/user/changepassword").post(verifyJWT, changeUserPassword)
router.route("/user/me").get(verifyJWT, me)
router.route("/user/createpost").post(verifyJWT, upload.single("image"), createPost)
router.route("/user/getmypost").get(verifyJWT, getMyPosts)
router.route("/user/getposts").get(verifyJWT, getPaginatedPosts)
router.route("/user/updatecaption").post(verifyJWT, updatePostCaption)
router.route("/user/deletepost").post(verifyJWT, deletePost)
router.route("/user/reportpost").post(verifyJWT, reportPost)
router.route("/user/savepost").post(verifyJWT, savePost)
router.route("/user/getsavedpost").get(verifyJWT, getSavedPosts)
router.route("/user/addcomment").post(verifyJWT, addComment)
router.route("/user/addreply").post(verifyJWT, addReply)
router.route("/user/getcomments").get(verifyJWT, getCommentsAndReplies)
router.route("/user/verifyemail/:token").get(verifyEmail)


router.route('/user/addvideo').post(verifyJWT, addVideo);
router.route('/user/getvideos').get(verifyJWT, getVideos);

export default router

