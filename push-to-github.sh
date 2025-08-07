#!/bin/bash

echo "🚀 正在推送 NailBox 项目到 GitHub..."
echo ""

# 检查当前目录
pwd

# 显示git状态
echo "📋 当前 Git 状态:"
git status

echo ""
echo "🔄 推送到 GitHub (需要你的GitHub用户名和密码/token):"

# 推送到GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 成功推送到 GitHub!"
    echo "📍 仓库地址: https://github.com/yzhou183/nailbox"
    echo ""
    echo "🎯 下一步: 部署到 Netlify"
    echo "1. 访问 https://netlify.com"
    echo "2. 用 GitHub 账号登录"
    echo "3. 点击 'New site from Git'"
    echo "4. 选择 'nailbox' 仓库"
    echo "5. 点击 'Deploy site'"
    echo ""
    echo "📱 部署完成后，你会获得一个免费的网址，可以立即访问你的美甲预约系统！"
else
    echo ""
    echo "❌ 推送失败，请检查网络连接和GitHub认证"
    echo "💡 提示: 如果需要认证，请使用你的GitHub用户名和Personal Access Token"
fi