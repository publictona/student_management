const bookmodel = require("../models/bookmodel")
const reviewmodel= require("../models/reviewmodel")
const mongoose = require('mongoose')
const moment = require('moment');

const addReviews = async function (req, res) {
    try {
        let data = req.body
        const {  rating ,review,reviewedBy} = data
        let bookId = req.params.bookId
        if (!Object.keys(data).length)
            return res.status(400).send({ status: false, msg: "you must add a review data" })

        if (!mongoose.isValidObjectId(bookId)) {

            return res.status(400).send({ status: false, msg: " Plz Enter valid bookId and retry it must be 24 character id" })
        }

        if (!rating) {
            return res.status(400).send({ status: false, msg: "rating is required" })
        }

        let ratingRegex = /^[1-5]$/
        if (!rating.trim().match(ratingRegex)) {
            return res.status(400).send({ status: false, msg: "rating should be between 1 to 5 " })
        }

        data.reviewedAt = Date.now()
        data.reviewedAt = moment().format("YYYY-MM-DD")
        data.bookId = bookId
        let addedReview = await reviewmodel.create({bookId,rating,review,reviewedBy,reviewedAt:new Date()})


        const checkBookId = await bookmodel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } })

        if (!checkBookId) {
            return res.status(404).send({ status: false, data: "No document found for review and update" })
        }
        res.status(201).send({ status: true, data: addedReview })
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}


////===================================UPDATR REVIEW ========================================================================//

const updatereview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let requestBody = req.body;
       const { review, rating , reviewedBy} = requestBody;
       
       
    if(!Object.keys(requestBody).length) return res.status(400).send({ status: false, message: "Data is required to update document" });

   
    if (!mongoose.isValidObjectId(bookId)) {
   return res.status(400).send({ status: false, msg: " Plz Enter valid bookId and retry it must be 24 character id" })}

    
    if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).send({ status: false, msg: " Plz Enter valid reviewId and retry it must be 24 character id" })}
    
       let isDeletedReview = await reviewmodel.findOne({ _id: reviewId, isDeleted: true })
        if (isDeletedReview) {
            return res.status(400).send({ satus: false, msg: "The review has already been deleted" })
        }

      
        let updatedBook = await bookmodel.findById(bookId)
        updatedBook.reviewsData = await reviewmodel.find({bookId, isDeleted:false},{isDeleted:0,createdAt:0, updatedAt:0 })
        res.status(200).send({status:true, msg :"Book list",data:updatedBook})     

         const updatedTheReview = await reviewmodel.findOneAndUpdate(
                    { _id: req.params.reviewId },
                    {
                        review: review,
                        rating: rating,
                        reviewedBy: reviewedBy,
                         reviewedAt: Date.now()
            
                    },
                    { new: true }
                  );

        res.status(200).send({ status: true, message: "Success", data: updatedTheReview })

         

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message });
    }
}




///======================================Delete Review=====================================================================//


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

  const deletereview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, msg: "BookId is missing" })

        if (!isValidObjectId(reviewId))
            return res.status(400).send({ status: false, msg: "ReviewId is missing" })

        let setId = await reviewmodel.findOne({bookId:bookId},{_id:reviewId})
        if(!setId) return res.status(404).send({status:false, msg:"Data Not Found Please Check Id"})

        
        let reviewDeleted= await reviewmodel.findOne({_id: reviewId, isDeleted:true})

     if (reviewDeleted) {
        return res.status(400).send({status:false, msg: "Review has already been deleted."})
     }

     let isReviewId= await reviewmodel.findById({_id: reviewId})
     if (bookId != isReviewId.bookId) {
        return res.status(400).send({status:false, msg: "This review not belongs to this particular book."})
     }
        let deletereview = await reviewmodel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, { new: true })

        let deletereview1 = await bookmodel.findOneAndUpdate({_id:bookId}, {$inc:{reviews:-1}})

        return res.status(400).send({ status: true, msg: "review deleted successfully", bookId: deletereview,deletereview1 })



    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.msg })

    }
}

module.exports.addReviews=addReviews

module.exports. deletereview=  deletereview

module.exports.updatereview =updatereview

