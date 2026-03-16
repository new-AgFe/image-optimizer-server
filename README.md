# 🖼️ AI-Powered Adaptive Image Optimizer

네트워크 상태를 실시간으로 감지하여, Gemini AI를 통해 이미지의 핵심 피사체를 분석하고 최적화된 크롭/압축 이미지를 서빙하는 지능형 엔진입니다.

## 🚀 Key Features
- **Real-time Network Detection**: 브라우저 API를 통한 사용자 대역폭(4G, 3G, 2G) 실시간 감지.
- **AI Smart Cropping**: Gemini 1.5 Flash를 사용하여 이미지 내 핵심 피사체 좌표 추출.
- **On-the-fly Processing**: Sharp 라이브러리를 이용한 서버 사이드 실시간 이미지 가공.
- **Automated Code Review**: GitHub Actions와 Gemini를 연동한 중앙 집중식 AI 코드 리뷰 시스템 구축.

## 🏗️ System Architecture
사용자 환경에 따라 데이터 흐름이 유기적으로 변화하는 구조입니다.



## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS (v4)
- **Backend**: Node.js, Express, Sharp
- **AI**: Google Gemini API (Multimodal)
- **DevOps**: GitHub Actions (Custom CI Workflow)
