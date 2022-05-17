const usermodel = require("../models/usermodel");
const bookmodel = require("../models/bookmodel")
const reviewmodel = require("../models/reviewmodel")


const createBooks = async (req, res) => {
  try {
    let data = req.body
    if (!Object.keys(data).length)
      return res.status(400).send({ status: false, msg: "You must enter data to create a book" })

    //===================================================/Authorization check/============================================//
    let userId = req.body.userId
    if (userId != req.userId)
      return res.status(401).send({ status: false, msg: "you have no Unauthorised to create this data." })
//-------------------------------------------------------------------------------------------------------------------------------------------------------------//
    if (!data.title)
      return res.status(400).send({ status: false, msg: "Title must be present" })
    const uniqueTitle = await bookmodel.findOne({ title: data.title })
    if (uniqueTitle) {
      return res.status(400).send({ status: false, msg: "This Title  already exists " })
    }

    if (!data.releasedAt) {
      return res.status(400).send({ status: false, msg: "releasedat is required" })
    }

    if (!data.releasedAt.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/))
      return res.status(400).send({ status: false, msg: "date should be in yyyy-mm-dd format " })

    if (!data.excerpt)
      return res.status(400).send({ status: false, msg: "excerpt must be present" })

    if (!data.userId)
      return res.status(400).send({ status: false, msg: "userId must be present" })

    if (!data.ISBN)
      return res.status(400).send({ status: false, msg: "ISBN must be present" })
    const uniqueISBN = await bookmodel.findOne({ ISBN: data.ISBN })
    if (uniqueISBN) {
      return res.status(400).send({ status: false, msg: "This ISBN code  is already exist " })
    }

    if (!data.category)
      return res.status(400).send({ status: false, msg: "category must be present" })

    if (!data.subcategory)
      return res.status(400).send({ status: false, msg: "subcategory must be present" })

    if (data.isDeleted)
      data.deletedAt = Date.now()

    if (!await usermodel.findById(req.body.userId))
      return res.status(400).send({ status: false, msg: "User Id is not  present in our Database" })

    let created = await bookmodel.create(data)
    res.status(201).send({ status: true, data: created })

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.msg })

  }
}

//============================================================Get_Books============================================================================


const isValidString = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const getbooks = async function (req, res) {
  try {
    let queryParams = req.query;
    let filterQuery = { ...queryParams, isDeleted: false, deletedAt: null };

    const { userId, category, subcategory } = queryParams

    if (!isValidString(userId)) {
      return res.status(400).send({ status: false, msg: "userId field cannot be empty" })
    }

    if (!isValidString(category)) {
      return res.status(400).send({ status: false, msg: "please provide category field." })
    }

    if (!isValidString(subcategory)) {
      return res.status(400).send({ status: false, msg: "please provide subcategory field." })
    }

    const books = await bookmodel.find(filterQuery).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

    if (!(books)) {
      return res.status(404).send({ status: false, message: "No booksfound" });
    }
    res.status(200).send({ status: true, message: "Books list", data: books });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};


//===================================================================  GET /books/:bookId===========================================================================

const getreview = async (req, res) => {
  try {
    let bookId = req.params.bookId
    if (!Object.keys(bookId).length)
      return res.status(400).send({ status: false, msg: "Book Id Is Mandetaroy" })

    let getBook = await bookmodel.findById(bookId)
    if (!getBook)
      return res.status(404).send({ status: false, msg: "Id should be valid" })

    let data = getBook._doc;
    data.reviewsData = await reviewmodel.find()

    res.status(200).send({ status: true, msg: "booklist", data: data })

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.msg })
  }
}


//================= UpdateBook ========================================================================================================================//


const updateBook = async (req, res) => {
  try {
    let bookId = req.params.bookId
    if (!bookId) return res.status(400).send({ status: false, message: "Book Id is required" });

    let checkBookId = await bookmodel.findById(bookId);
    if (!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if (checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" });

    let data = req.body;
    if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Data is required to update document" });

    let uniquevalue = await bookmodel.findOne({ ISBN: data.ISBN })
    if (uniquevalue)
      return res.status(400).send({ status: false, msg: " isbn already exist" })

    let uniquevalue1 = await bookmodel.findOne({ title: data.title })
    if (uniquevalue1)
      return res.status(400).send({ status: false, msg: "title  already exist" })

    ///=====================authorization =================//
    if (checkBookId.userId != req.userId) {
      return res.status(400).send({ status: false, message: 'you have no Unauthorised to update this data Access.' });
    }
    //----------------------------------------------------------------------------------------------------------------------------------------//
    let updateBook = await bookmodel.findOneAndUpdate({ _id: bookId }, data, { new: true })
    return res.status(200).send({ status: true, data: updateBook })

  }
  catch (error) {
    console.log(error.message)
    return res.status(400).send({ status: false, message: error.message })
  }
};
//========================================================   DeleteBook =======================================================================================/

const deleteBook = async (req, res) => {
  try {

    let bookId = req.params.bookId
    if (!bookId) return res.status(400).send({ status: false, msg: "book Id not found" })


    let deletebooks = await bookmodel.findById(bookId)
    if (!deletebooks) return res.status(400).send({ status: false, msg: "Book Id Is Not Valid" })

    // ******Authoorization check *********************//
    if (deletebooks.userId != req.userId) {
      //------------------------------------------------------------------------------------------------------------------//
      return res.status(403).send({
        status: false,
        message: 'you have no Unauthorised to Delete this data Access.',
      });
    }

    const alreadyDeleted = await bookmodel.findOne({ _id: bookId, isDeleted: true })
    if (alreadyDeleted) {
      return res.status(400).send({ status: false, msg: `${alreadyDeleted.title} is already been deleted.` })
    }

    let deletebook = await bookmodel.findOneAndUpdate({ _id: bookId }, { isDeleted: true }, { new: true })
    return res.status(200).send({ status: true, msg: "document deleted successfully", bookId: deletebook })


  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error })

  }
}

//****************************************************Exporting*********************************************************************************/

module.exports.createBooks = createBooks
module.exports.getbooks = getbooks
module.exports.getreview = getreview
module.exports.deleteBook = deleteBook
module.exports.updateBook = updateBook