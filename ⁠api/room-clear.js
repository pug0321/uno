import { GoogleGenAI } from '@google/genai';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: '画像データが送信されていません。' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'サーバー側のAPIキーが設定されていません。' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Imagen モデルを使用して画像を生成・編集
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error('Imagenによる画像生成に失敗しました。');
        }

        const imageBytes = response.generatedImages[0].image.imageBytes;
        const resultBase64 = `data:image/jpeg;base64,${imageBytes}`;

        return res.status(200).json({ 
            imageUrl: resultBase64 
        });

    } catch (error) {
        console.error('Imagen API Error:', error);
        return res.status(500).json({ 
            error: error.message || '画像生成処理中にエラーが発生しました。' 
        });
    }
}
