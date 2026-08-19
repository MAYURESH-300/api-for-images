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

const FOLDERS = {
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
}

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cloudinary Image API is running"
    });
});

app.get("/api/images/:type/:id", async (req, res) => {
    try {
        const type = req.params.type.toLowerCase();
        const id = req.params.id;

        if (!FOLDERS[type]) {
            return res.status(400).json({
                success: false,
                error: "Invalid type",
                allowedTypes: Object.keys(FOLDERS)
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "ID is required"
            });
        }

        const folder = FOLDERS[type];

        console.log("Looking for:");
        console.log("Type:", type);
        console.log("Folder:", folder);
        console.log("Public ID:", id);

        const result = await cloudinary.search
            .expression(
                `public_id="${id}" AND asset_folder="${folder}"`
            )
            .max_results(1)
            .execute();

        if (!result.resources || result.resources.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Image not found",
                type: type,
                id: id,
                folder: folder
            });
        }

        const asset = result.resources[0];

        const imageUrl = getImageUrl(asset.public_id);

        res.json({
            success: true,
            type: type,
            id: id,
            folder: folder,
            publicId: asset.public_id,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error("FULL CLOUDINARY ERROR:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message || "Cloudinary request failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
