# 使用 Node.js 20 镜像
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制编译好的代码
COPY dist ./dist

# 设置环境变量
ENV GITHUB_TOKEN=""

# 赋予执行权限
RUN chmod +x dist/index.js

# 使用 stdio 运行
ENTRYPOINT ["node", "dist/index.js"]
