require("dotenv").config();

const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// These are Cloudinary asset folders.
// "Home" is the Media Library root and is NOT included.
const MEDIA_FOLDERS = {
    movies: "Images/Movies",
    series: "Images/Series",
    anime: "Images/Anime",
    posters: "Images/Posters",
    banners: "Images/Banners",
    other: "Images/Other"
};

function getImageUrl(publicId) {
    return cloudinary.url(publicId, {
        resource_type: "image",
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
}

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cloudinary Media API is running"
    });
});

app.get("/api/media/:category", async (req, res) => {
    try {
        const category = req.params.category.toLowerCase();

        const folder = MEDIA_FOLDERS[category];

        if (!folder) {
            return res.status(400).json({
                success: false,
                error: "Invalid media category",
                availableCategories: Object.keys(MEDIA_FOLDERS)
            });
        }

        const result = await cloudinary.search
            .expression(`asset_folder="${folder}"`)
            .sort_by("created_at", "desc")
            .max_results(500)
            .execute();

        const media = result.resources.map(asset => ({
            id: asset.asset_id,
            publicId: asset.public_id,
            fileName: asset.display_name || asset.public_id,
            format: asset.format,
            width: asset.width,
            height: asset.height,
            bytes: asset.bytes,
            createdAt: asset.created_at,
            imageUrl: getImageUrl(asset.public_id)
        }));

        res.json({
            success: true,
            category: category,
            folder: folder,
            count: media.length,
            media: media
        });

    } catch (error) {
        console.error("Cloudinary Search Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
