require("dotenv").config();

const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const movies = [
    {
        id: 1024,
        title: "series",
        poster: "1024"
    }
];

function getImageUrl(publicId, width = 500) {
    return cloudinary.url(publicId, {
        resource_type: "image",
        secure: true,
        transformation: [
            {
                width: width,
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
        message: "Cloudinary Movie API is running"
    });
});

// Test one image
app.get("/api/image", (req, res) => {
    const publicId = req.query.publicId;

    if (!publicId) {
        return res.status(400).json({
            success: false,
            error: "publicId is required"
        });
    }

    const imageUrl = getImageUrl(publicId);

    res.json({
        success: true,
        publicId: publicId,
        imageUrl: imageUrl
    });
});

// Get movies
app.get("/api/movies", (req, res) => {
    const result = movies.map(movie => ({
        ...movie,
        posterUrl: getImageUrl(movie.poster)
    }));

    res.json({
        success: true,
        count: result.length,
        movies: result
    });
});

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});