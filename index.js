// index.js (백엔드 서버)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors()); // 프론트엔드 접속 허용

async function getSubjectCoordinates(imageBuffer) {
    try {
        // Gemini 설정 (코딩 리뷰 봇 때 쓰던 그 Key!)
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // 이미지를 Gemini가 이해할 수 있는 base64 형식으로 변환
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        };

        const prompt = "이 이미지에서 가장 중심이 되는 피사체의 위치를 찾아줘. JSON 형식으로 반드시 응답해줘: { 'x': 숫자, 'y': 숫자, 'width': 숫자, 'height': 숫자 }. 좌표값은 이미지의 픽셀 단위가 아닌 0~1000 사이의 상대값으로 줘.";

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [ // content가 아니라 contents입니다!
                {
                    role: 'user',
                    parts: [
                        { text: prompt }, // 텍스트 파트
                        imagePart         // 이미지 파트 (inlineData)
                    ]
                }
            ],
        });
        const text = result.text;
        console.log("🤖 AI 원문 응답:", text);
        
        // JSON 문자열만 추출 (가끔 AI가 마크다운을 섞을 때를 대비)
        const jsonMatch = text.match(/\{.*\}/s);
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("AI 분석 실패, 기본값 사용:", e);
        return { x: 500, y: 500, width: 500, height: 500 }; // 실패 시 중앙값
    }
}

app.get('/api/image', async (req, res) => {
    const imageUrl = req.query.url; // 원본 이미지 주소
    const network = req.query.network || '4g'; // 네트워크 상태 ('4g', '3g', '2g')

    if (!imageUrl) return res.status(400).send('Image URL is required');

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data, 'binary');
        const metadata = await sharp(inputBuffer).metadata(); // 이미지 크기 정보 가져오기

        let output;

        if (network === '4g') {
            output = sharp(inputBuffer).webp({ quality: 80 });
        } else {
            // ⚠️ 저대역폭 모드: AI 분석 후 스마트 크롭
            const coords = await getSubjectCoordinates(inputBuffer);
            
            // 상대 좌표(0~1000)를 실제 픽셀 좌표로 변환
            const extractRegion = {
                left: Math.round((coords.x / 1000) * metadata.width),
                top: Math.round((coords.y / 1000) * metadata.height),
                width: Math.round((coords.width / 1000) * metadata.width),
                height: Math.round((coords.height / 1000) * metadata.height)
            };

            output = sharp(inputBuffer)
                .extract(extractRegion) // 핵심 부분만 잘라내기
                .resize(400, 400, { fit: 'cover' }) // 사이즈 축소
                .webp({ quality: 20 }); // 압축률 극대화
        }

        const finalBuffer = await output.toBuffer();
        res.set('Content-Type', 'image/webp');
        res.send(finalBuffer);
    } catch (error) {
        console.error('❌ 최적화 실패:', error.message);
        res.status(500).send('Image optimization failed');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 AI Image Optimizer Server running on http://localhost:${PORT}`);
});