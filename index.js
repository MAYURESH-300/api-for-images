require("dotenv").config();

const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Media data
const media = [
    {
        id: 1024,
        title: "series",
        type: "series",
        publicId: "1024"
    }
];

// Create Cloudinary CDN URL
function getImageUrl(publicId, width = 500) {
    return cloudinary.url(publicId, {
        resource_type: "image",
        secure: true,
        transformation: [
            {
                width,
                crop: "limit",
                fetch_format: "auto",
                quality: "auto"
            }
        ]
    });
}

// Home
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Media API is running"
    });
});

// Get all media
app.get("/api/media", (req, res) => {
    const result = media.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        publicId: item.publicId,
        imageUrl: getImageUrl(item.publicId)
    }));

    res.json({
        success: true,
        count: result.length,
        media: result
    });
});

// Get media by type
app.get("/api/media/:type", (req, res) => {
    const type = req.params.type.toLowerCase();

    const allowedTypes = [
        "movies",
        "series",
        "anime",
        "posters",
        "banners",
        "other"
    ];

    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            error: "Invalid media type",
            allowedTypes
        });
    }

    const normalizedType = type === "movies" ? "movie" : type.slice(0, -1);

    const result = media
        .filter(item => item.type === normalizedType)
        .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            publicId: item.publicId,
            imageUrl: getImageUrl(item.publicId)
        }));

    res.json({
        success: true,
        type,
        count: result.length,
        media: result
    });
});

// Test a specific Cloudinary image
app.get("/api/image", (req, res) => {
    const publicId = req.query.publicId;

    if (!publicId) {
        return res.status(400).json({
            success: false,
            error: "publicId is required"
        });
    }

    res.json({
        success: true,
        publicId,
        imageUrl: getImageUrl(publicId)
    });
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
