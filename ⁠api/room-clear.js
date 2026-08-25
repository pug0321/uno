import { GoogleGenAI } from '@google/genai';
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
const base64Data = image.replace(/^data:image/[a-z]+;base64,/, '');
const imageBuffer = Buffer.from(base64Data, 'base64');
const response = await ai.models.generateContent({
model: 'gemini-2.5-flash',
contents: [
{
inlineData: {
data: imageBuffer.toString('base64'),
mimeType: 'image/jpeg'
}
},
{
text: prompt + " 処理後の画像データ（Base64形式、または画像URL）のみ、あるいは構造化された結果を返してください。"
}
]
});
// テスト用のレスポンス返却
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
