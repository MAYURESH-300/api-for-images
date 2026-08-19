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

const ALLOWED_TYPES = [
    "movies",
    "series",
    "anime",
    "posters",
    "banners",
    "other"
];

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

        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                error: "Invalid type",
                allowedTypes: ALLOWED_TYPES
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "ID is required"
            });
        }

        // Find the Cloudinary image using ONLY the unique Public ID.
        const asset = await cloudinary.api.resource(id, {
            resource_type: "image",
            type: "upload"
        });

        res.json({
            success: true,
            type: type,
            id: id,
            publicId: asset.public_id,
            format: asset.format,
            width: asset.width,
            height: asset.height,
            imageUrl: getImageUrl(asset.public_id)
        });

    } catch (error) {
        console.error("Cloudinary error:", error);

        if (error.error && error.error.http_code === 404) {
            return res.status(404).json({
                success: false,
                error: "Image not found",
                id: req.params.id
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
