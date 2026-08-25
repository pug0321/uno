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

        // ここで本来のAI処理、またはプレビュー用の画像返却を行う
        // 通信エラーを完全に防ぎ、フロントへ確実に画像を返すための処理
        console.log("Received prompt:", prompt);

        // テストおよび動作確認用として、受け取った画像データをそのまま返す（または加工画像URLを返す）
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
