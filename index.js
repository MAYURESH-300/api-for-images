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

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Cloudinary Image API is running"
    });
});

app.get("/api/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "ID is required"
            });
        }

        const result = await cloudinary.search
            .expression(`public_id="${id}"`)
            .max_results(1)
            .execute();

        if (!result.resources || result.resources.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Image not found",
                id: id
            });
        }

        const asset = result.resources[0];

        const imageUrl = cloudinary.url(asset.public_id, {
            resource_type: asset.resource_type,
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
            folder: asset.asset_folder || null,
            publicId: asset.public_id,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
