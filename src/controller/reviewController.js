const bookmodel = require("../models/bookmodel")
const reviewmodel= require("../models/reviewmodel")
const mongoose = require('mongoose')
const { request } = require("express")



const addReviews = async function (req, res) {
    try {
        let data = req.body
        const {  rating } = data
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
        data.bookId = bookId
        let addedReview = await reviewmodel.create(data)


        const checkBookId = await bookmodel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: +1 } })

        if (!checkBookId) {
            return res.status(404).send({ status: false, data: "No document found for review and update" })
        }
        res.status(200).send({ status: true, data: addedReview })
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
        let requestBody = req.body
        const { review, rating, reviewedBy, reviewedAt } = requestBody;
        if (!bookId)
            return res.status(400).send({ status: false, msg: "please enter the bookid" })

        if (!reviewId)
            return res.status(400).send({ status: false, msg: "Please enter reviewId" })
        if (!review)
            return res.status(400).send({ status: false, msg: "Review is required for updation" })


        let isDeletedReview = await reviewmodel.findOne({ _id: reviewId, isDeleted: true })
        if (isDeletedReview) {
            return res.status(400).send({ satus: false, msg: "The review has already been deleted" })
        }

        if (!rating)
            return res.status(400).send({ status: false, msg: "Please enter rating" })

        if (!reviewedBy)
            return res.status(400).send({ status: false, msg: "Please enter reviewedBy" })


       
        //if (!isValidObjectId(requestBody)) return res.status(400).send({ status: false, message: "Data is required to update document" });


        if (!((rating < 6) && (rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });

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