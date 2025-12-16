import { v2 as cloudinary } from 'cloudinary';
import type { IncomingMessage, ServerResponse } from "http";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryResource {
    secure_url: string;
    public_id: string;
}

interface ImageResponse {
    src: string;
    alt: string;
    category: string;
}

export default async function handler(
    req: IncomingMessage & { query?: Record<string, string> },
    res: ServerResponse
) {
    const sendJSON = (status: number, data: object) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    };

    if (req.method !== 'GET') {
        return sendJSON(405, { error: "Method not allowed" });
    }

    const category  = req.query?.category;

    if (!category) return sendJSON(400, { error: "Category is required" });

    try {
        const result = await cloudinary.search
            .expression(`tags=${category}`)
            .sort_by('created_at', 'desc')
            .max_results(40)
            .execute();

        const images: ImageResponse[] = result.resources.map((img: CloudinaryResource) => ({
            src: img.secure_url,
            alt: img.public_id,
            category
        }));


        sendJSON(200, images);
    } catch (error) {
        console.error('Error fetching images:', error);
        sendJSON(500, { error: "Error fetching images" });
    }
}

export const config = {
    runtime: "nodejs",
};