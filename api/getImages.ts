import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryResource {
    secure_url: string;
    public_id: string;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { category } = req.query;

    if (!category || typeof category !== 'string') {
        res.status(400).json({ error: 'Category is required' });
        return;
    }

    try {
        const result = await cloudinary.search
            .expression(`tags=${category}`)
            .sort_by('created_at', 'desc')
            .max_results(40)
            .execute();

        const images = result.resources.map((img: CloudinaryResource) => ({
            src: img.secure_url,
            alt: img.public_id,
            category
        }));


        res.status(200).json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Error fetching images' });
    }
}

export const config = {
    runtime: "nodejs",
};