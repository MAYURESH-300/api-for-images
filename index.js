require("dotenv").config();

const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000 , "0.0.0.0";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cloudinary Image API is running"
    });
});

app.get("/api/:id", (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "ID is required"
        });
    }

    const imageUrl = cloudinary.url(id, {
        resource_type: "image",
        type: "upload",
        secure: true,
        transformation: [
            {
                width: 500,
                crop: "limit",
                fetch_format: "auto",
                quality: "auto"
            }
        ]
    });

    res.json({
        success: true,
        id: id,
        imageUrl: imageUrl
    });
});

app.listen(PORT, "0.0.0.0" () => {
    console.log(`API running on port ${PORT}`);
});
