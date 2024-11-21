import express from "express";
import {  NOT_FOUND, CREATED, SERVER_ERROR, OK } from "../util";
import { isInfoSupplied } from "../middleware";  // Import validation middleware
import Challenge from "../models/Challenge";
import { auth } from "../authMiddleware";
import User from "../models/User";
import mongoose from "mongoose";
const router = express.Router();
interface CustomRequest extends express.Request {
  userID?: string;
}


router.post(
  "/createChallenge",
  auth,
  isInfoSupplied("body", "title", "description"),
  async (req: CustomRequest, res) => {
    const { title, description } = req.body;

    try {
      const challenge = new Challenge({ title, description, createdBy: req.userID });
      await challenge.save();
      await User.findByIdAndUpdate(
        req.userID,
        { $push: { createdChallenges: challenge._id } },
        { new: true }
      );
      res.status(CREATED).json({ message: "Challenge created successfully" });
    } catch (error) {
      res.status(SERVER_ERROR).json({ error: "Error creating user", details: error.message });
    }
  }
);

router.post(
  "/completeChallenge",
  auth,
  isInfoSupplied("body", "challengeID"),
  async (req: CustomRequest, res) => {
    const { challengeID } = req.body;

    try {
      const challenge = await Challenge.findById(challengeID);
      if (!challenge) {
        return res.status(NOT_FOUND).json({ error: "Challenge not found" });
      }

      // Check if the challenge is expired
      const isExpired =
        new Date().getTime() - new Date(challenge.createdAt).getTime() >
        7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

      if (isExpired) {
        return res
          .status(400)
          .json({ error: "Challenge has expired and cannot be completed." });
      }

      const user = await User.findById(req.userID);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: "User not found" });
      }

      // Ensure the challenge is in the user's active challenges
      if (!user.activeChallenges.includes(challengeID)) {
        return res
          .status(400)
          .json({ error: "Challenge is not in your active challenges." });
      }

      // Update user's completed challenges and reward points
      user.completedChallenges.push(challengeID);
      user.activeChallenges = user.activeChallenges.filter(
        (id) => id.toString() !== challengeID
      );
      user.auraPoints += challenge.reward;
      user.totalCompleted += 1;

      await user.save();

      res.status(OK).json({
        message: "Challenge completed successfully!",
        auraPoints: user.auraPoints,
      });
    } catch (error) {
      res
        .status(SERVER_ERROR)
        .json({ error: "Couldn't complete challenge!", details: error.message });
    }
  }
);




router.post("/updateChallenge",
  auth, //this is how you auth the route
  isInfoSupplied("body", "challengeID", "title", "description"),
  async (req: CustomRequest, res) => {
  const { challengeID,title,description } = req.body;
  try {
    const objChallengeID = new mongoose.Types.ObjectId(challengeID);
    const challenge = await Challenge.findById(objChallengeID);
    if (!challenge) {
      return res.status(NOT_FOUND).json({ message: "Challenge not found" });
    }
    const user = await User.findById(req.userID);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: "User not found" });
    }
    console.log("challenge creator id", challenge.createdBy);
    console.log("current user id", user._id);
    if(challenge.createdBy.toString() !== user._id.toString()){
      return res.status(NOT_FOUND).json({ message: "You are not the creator of this challenge!" });
    }
    challenge.title = title;
    challenge.description = description;
    await challenge.save();
    res.status(OK).json({ message: "Challenge updated successfully!" });
  } catch (error) {
    res.status(SERVER_ERROR).json({ message: "Error updating challenge", details: error.message });
  }
});


/*Work here 
DeleteChallenge:
auth the route (look at the other routes for how to do this)
body: challengeID
1. Check if challenge exists
2. If it does delete challenge from database
*/
router.delete(
  "/deleteChallenge",
  auth,
  isInfoSupplied("body", "challengeID"),
  async (req: CustomRequest, res) => {
    const { challengeID } = req.body;
    try {
      const objChallengeID = new mongoose.Types.ObjectId(challengeID);
      const challenge = await Challenge.findById(objChallengeID);

      if (!challenge) {
        return res.status(NOT_FOUND).json({ error: "Challenge not found" });
      }

      const user = await User.findById(req.userID);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: "User not found" });
      }

      if (challenge.createdBy.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "Unauthorized to delete this challenge" });
      }

      await Challenge.findByIdAndDelete(objChallengeID);

      await User.findByIdAndUpdate(
        req.userID,
        { $pull: { createdChallenges: objChallengeID } },
        { new: true }
      );

      res.status(OK).json({ message: "Challenge deleted successfully!" });
    } catch (error) {
      res.status(SERVER_ERROR).json({ error: "Error deleting challenge", details: error.message });
    }
  }
);


/*
SearchChallenge:
auth the route 
body: title
1. Find all challenges that have the title in the body
2. Return the challenges found in the response as an array 
*/

router.post(
  "/searchChallenge",
  auth,
  isInfoSupplied("body", "title"),
  async (req: CustomRequest, res) => {
    const { title } = req.body;

    try {
      const challenges = await Challenge.find({
        title: { $regex: new RegExp(title, "i") }, // Case-insensitive search
      });

      if (challenges.length === 0) {
        return res.status(NOT_FOUND).json({ message: "No challenges found" });
      }

      res.status(OK).json(challenges);
    } catch (error) {
      res
        .status(SERVER_ERROR)
        .json({ error: "Error searching challenges", details: error.message });
    }
  }
);


export default router;
