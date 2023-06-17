const ID_Image = require('../models/id_image');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');






// ------------ Image Specific Code----------
const Grid = require("gridfs-stream");

const dbInstance = mongoose.connection;

let gfs, gridfsBucket;

dbInstance.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(dbInstance.db, {
        bucketName: "id_image",
    });

    gfs = Grid(dbInstance.db, mongoose.mongo);
    gfs.collection("id_image");
});

//-----------Get an Image----------------
exports.get_image = async (req, res, next) => {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (file != null) {
        const readstream = gridfsBucket.openDownloadStream(file._id);
        // var readstream = gfs.createReadStream({ filename: req.params.filename });
        readstream.on("error", function (err) {
            res.send("No image found with that title");
        });
        readstream.pipe(res);
    }
};


//************************* ID_Image CONTROLLER ***************************//


// @route POST /id_image
// @description creates and stores the identification image
// @access Private
exports.create_id_image = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId

    //convert base64 image to buffer


    const id_image = new ID_Image({
      userId: userId,
      dateUploaded: new Date(),
      img_url: "https://crib-llc.herokuapp.com/id_image/id_images/" +req.file.filename
    });
    id_image
      .save()
      .then(async (cont) => {
        res.json({ msg: 'ID Image Stored Successfully' })
      })
      .catch(err => res.status(400).json({ error: 'Unable to store email', errRaw: err }));
  
};

