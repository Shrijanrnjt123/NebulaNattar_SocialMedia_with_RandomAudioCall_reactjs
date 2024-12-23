import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const replySchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    ref: "User",
    required: true
  },


  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const commentSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  postId:{
    type: Schema.ObjectId,
    ref: 'Posts',
    required: true
  },

  name: {
    type: String,
    ref: "User",
    required: true
  },

  text: {
    type: String,
    required: true
  },

  replies: [replySchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new Schema({

  userid: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    ref: 'User',
    required: true
  },

  caption: {
    type: String,
  },

  reports: [{
    type: Schema.ObjectId,
    ref: 'User',
  }],

  saved: [{
    type: Schema.ObjectId,
    ref: 'User',
  }],

  postStatus: {
    type: String,
    enum: ["enable", "disable"],
    default: "enable"
  },

  images: {
    type: String,
  },
  comments: [commentSchema]

}, { timestamps: true });

postSchema.plugin(mongoosePaginate);

export const Posts = mongoose.model("Posts", postSchema);



