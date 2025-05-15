# Node.js 기반 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치를 위한 package.json만 미리 복사 (필요 시)
COPY package.json package-lock.json ./
RUN npm install

# 포트 노출
EXPOSE 3000

# React 개발 서버 실행
CMD ["npm", "start"]
