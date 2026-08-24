export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image, prompt } = req.body;

    if (!image || !prompt) {
        return res.status(400).json({ error: 'Missing image or prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set on Vercel environment variables' });
    }

    try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

        // 画像出力に対応したモデル（gemini-3.1-flash-image-preview等）を指定
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini Image API Error: ${errText}`);
        }

        const data = await response.json();
        
        // レスポンスのpartsからinline_data（生成された画像）を安全に抽出する
        let generatedImageUrl = null;
        const parts = data.candidates?.[0]?.content?.parts;
        
        if (parts && Array.isArray(parts)) {
            for (const part of parts) {
                if (part.inline_data && part.inline_data.data) {
                    const outMime = part.inline_data.mime_type || 'image/jpeg';
                    generatedImageUrl = `data:${outMime};base64,${part.inline_data.data}`;
                    break;
                }
            }
        }

        // 画像が見つからなかった場合は元の画像をフォールバックとして返す
        if (!generatedImageUrl) {
            generatedImageUrl = image;
        }

        return res.status(200).json({ imageUrl: generatedImageUrl });

    } catch (error) {
        console.error("Server relay error:", error);
        return res.status(500).json({ error: error.message });
    }
}
