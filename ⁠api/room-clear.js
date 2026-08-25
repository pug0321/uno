export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: '画像データが送信されていません。' });
        }

        console.log("Prompt received:", prompt);

        // 正常に画像データが往復するかのテストレスポンス
        return res.status(200).json({ 
            imageUrl: image 
        });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: error.message || 'サーバー内部でエラーが発生しました。' 
        });
    }
}
