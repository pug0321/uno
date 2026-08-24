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

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            imageUrl: {
                                type: "STRING",
                                description: "The generated or processed room image as a base64 data URL"
                            }
                        },
                        required: ["imageUrl"]
                    }
                }
            })
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`Gemini API Error: ${errText}`);
        }

        const data = await geminiResponse.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        let resultJson;
        try {
            resultJson = JSON.parse(candidateText);
        } catch (e) {
            resultJson = { imageUrl: image }; 
        }

        return res.status(200).json({ imageUrl: resultJson.imageUrl || image });

    } catch (error) {
        console.error("Server relay error:", error);
        return res.status(500).json({ error: error.message });
    }
}
