import express from "express";
// import { v2 as cloudinary } from "cloudinary";
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js";
import "dotenv/config";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

/**
 * Adds a user submitted book if logged in with a valid token
 * and all required fields are present.
 *
 * @method POST to create a book record
 *
 * @see protectRoute method confirms the user has a valid token and adds their data to the request data here
 */
router.post("/", protectRoute, async (req, res) => {
  console.log("post/books/", {body: {...req?.body, len: req?.body.image?.length, image: req?.body.image.substring(0, 10)}} );
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "Please provide all fields." });
    }



    // console.log("post/books/cloudinary/ data", {
    //   n: process.env.CLOUDINARY_CLOUD_NAME,
    //   k: process.env.CLOUDINARY_API_KEY.slice(-5),
    //   s: process.env.CLOUDINARY_API_SECRET.slice(-5),
    // });

    const uploaderResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploaderResponse.secure_url;

    // save to the Db
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error("post/books/error/", error);
    return res.status(500).json({message: error.message})
  }
});

/**
 * Fetch all books with pagination for infinite scrolling.
 * Returned in descending order
 *
 * @method GET to fetch all books
 * @see protectRoute
 */
router.get("/", protectRoute, async (req, res) => {
  try {
    // get the current pagination info
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    console.log("get/books/", { page, limit, skip });

    const books = await Book.find()
      .sort({ createdAt: -1 }) // descending
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    // You need to await the countDocuments query
    const totalBooks = await Book.countDocuments();

    res.json({
      books,
      // totalBooks,
      // currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("get/books/error", error.message);
    return res
      .status(500)
      .json({ message: "br75, Internal server error: " + error.message });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  console.log("get/books/user/", { reqBody: req.body });
  try {
    const books = await Books.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(books);
  } catch (error) {
    console.error("get/books/user/", error);
    return res.status(500).json({ message: "br88, Internal server error" });
  }
}); // get / user

/**
 * Delete given book data iff belongs to the authenticated user.
 * Also deletes the book image record.
 *
 * @method DELETE to remove record
 * @see protectRoute
 */
router.delete("/:id", protectRoute, async (req, res) => {
  console.log("delete/books/", { reqBody: req.body });
  try {
    const id = req.params.id;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.user.toString() !== req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // delete the book image too
    if (book?.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("delete/books/delete/image/error", error);
      }
    }

    book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("delete/books/error", error);
    return res.status(500).json({ message: "br127, Internal server error" });
  }
}); // delete / :id

export default router;
