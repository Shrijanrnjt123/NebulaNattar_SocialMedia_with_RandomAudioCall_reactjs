import Video from '../modules/video.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";

export const addVideo = async (req, res) => {
  const { videoUrl } = req.body;
  const userId = req.user._id;

  try {
    const video = new Video({ userId, videoUrl });
    await video.save();
    res.status(200).json(new ApiResponse(200, video, 'Video added successfully'));
  } catch (err) {
    res.status(err.statusCode || 500).json(new ApiResponse(err.statusCode || 500, null, err.message || 'Internal Server Error'));
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate('userId', 'name');
    res.status(200).json(new ApiResponse(200, videos, 'Videos fetched successfully'));
  } catch (err) {
    res.status(err.statusCode || 500).json(new ApiResponse(err.statusCode || 500, null, err.message || 'Internal Server Error'));
  }
};
