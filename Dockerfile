# Node.js 베이스 이미지 사용
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# package.json 파일을 컨테이너에 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 애플리케이션 소스 코드를 모두 컨테이너에 복사
COPY . .

# 포트 설정
EXPOSE 3000

# 애플리케이션 실행 명령어
CMD ["node", "index.js"]
