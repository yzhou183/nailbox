# NailBox 美甲预约系统 - 部署指南

## 快速部署到 Netlify (推荐)

### 方法1: 通过 Git 部署 (推荐)

1. **创建 GitHub 仓库**
   ```bash
   # 如果还没有推送到GitHub
   git remote add origin https://github.com/你的用户名/nailbox.git
   git branch -M main
   git push -u origin main
   ```

2. **连接 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用GitHub账号登录
   - 点击 "New site from Git"
   - 选择GitHub并授权
   - 选择你的 nailbox 仓库
   - 构建设置保持默认 (构建命令留空，发布目录填 ".")
   - 点击 "Deploy site"

3. **配置自定义域名** (可选)
   - 在 Site settings > Domain management
   - 添加自定义域名
   - 配置DNS记录

### 方法2: 拖拽部署

1. **准备文件**
   - 确保所有文件在同一目录: `index.html`, `styles.css`, `script.js`

2. **直接部署**
   - 访问 [netlify.com](https://netlify.com)
   - 将整个文件夹拖拽到部署区域
   - 等待部署完成

## 其他部署选项

### Vercel 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署**
   ```bash
   cd /path/to/your/project
   vercel
   # 按照提示完成设置
   ```

### GitHub Pages 部署

1. **启用 GitHub Pages**
   - 进入仓库 Settings
   - 找到 Pages 选项
   - Source 选择 "Deploy from a branch"
   - 选择 main 分支，目录选择 / (root)
   - 保存

2. **访问网站**
   - 网址格式: `https://你的用户名.github.io/仓库名/`

### 自有服务器部署

1. **购买域名和服务器**
   - 域名注册商: 阿里云、腾讯云、GoDaddy
   - 服务器: 阿里云ECS、腾讯云CVM、DigitalOcean

2. **服务器配置**
   ```bash
   # 安装 Nginx
   sudo apt update
   sudo apt install nginx
   
   # 上传文件到服务器
   scp -r * user@server_ip:/var/www/html/
   
   # 配置 Nginx
   sudo nano /etc/nginx/sites-available/nailbox
   ```

3. **Nginx 配置示例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

4. **启用 HTTPS**
   ```bash
   # 使用 Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 部署后优化

### 1. 性能优化
- 启用 gzip 压缩
- 配置浏览器缓存
- 优化图片大小

### 2. SEO 优化
- 添加 meta 标签
- 配置 robots.txt
- 生成 sitemap.xml

### 3. 监控和分析
- 集成 Google Analytics
- 设置错误监控
- 配置性能监控

## 域名建议

- nailbox.com
- nailbox.co
- booknails.com
- mynailbox.com
- nailstudio.app

## 注意事项

1. **数据存储**: 当前使用本地存储，生产环境建议使用数据库
2. **备份**: 定期备份代码和数据
3. **安全**: 如有敏感信息，注意数据保护
4. **维护**: 定期更新和维护网站

## 成本预估

- **免费方案**: Netlify/Vercel/GitHub Pages - $0/月
- **基础方案**: 域名($10/年) + Netlify Pro($19/月)
- **专业方案**: 域名($10/年) + 云服务器($5-20/月) + CDN($5/月)

## 技术支持

如遇到部署问题，可以：
- 查看平台官方文档
- 检查浏览器控制台错误信息
- 确认所有文件路径正确
- 检查文件编码为UTF-8