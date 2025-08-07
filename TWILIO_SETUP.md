# Twilio SMS 配置指南

## 1. 注册Twilio账户

1. 访问 https://www.twilio.com
2. 点击 "Sign up for free" 注册免费账户
3. 验证您的手机号码

## 2. 获取配置信息

登录Twilio控制台后：

### 获取 Account SID 和 Auth Token:
1. 在控制台首页找到 "Account Info" 部分
2. 复制 "Account SID" 
3. 复制 "Auth Token"

### 获取 Twilio 电话号码:
1. 在左侧菜单点击 "Phone Numbers" → "Manage" → "Buy a number"
2. 选择一个支持SMS的电话号码
3. 购买后复制这个号码

## 3. 配置代码

在 `script.js` 文件中找到以下配置，替换为您的真实值：

```javascript
this.smsConfig = {
    enabled: true,
    adminPhone: '3238189780',
    // 替换为您从Twilio获取的真实值
    twilioAccountSid: 'your_twilio_account_sid_here',    // 替换为真实的Account SID
    twilioAuthToken: 'your_twilio_auth_token_here',      // 替换为真实的Auth Token  
    twilioFromNumber: 'your_twilio_phone_number_here'    // 替换为您购买的Twilio号码
};
```

### 示例配置:
```javascript
this.smsConfig = {
    enabled: true,
    adminPhone: '3238189780',
    twilioAccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    twilioAuthToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    twilioFromNumber: '+1xxxxxxxxxx'
};
```

## 4. 重要注意事项

### 安全性:
- **⚠️ 不要将真实的API密钥提交到GitHub**
- **生产环境建议使用环境变量:**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN` 
  - `TWILIO_FROM_NUMBER`
- 当前代码已支持环境变量，会优先使用环境变量中的值
- 如果GitHub检测到密钥，考虑重新生成Auth Token
- 免费账户有使用限制

### 电话号码格式:
- 美国号码会自动添加 +1 前缀
- 确保管理员号码 `3238189780` 格式正确
- 客户输入的号码会自动格式化

### 免费账户限制:
- Twilio免费账户有 $15 信用额度
- 只能向验证过的号码发送短信
- 需要在Twilio控制台验证接收短信的号码

## 5. 测试SMS功能

配置完成后：

1. 在Twilio控制台的 "Verified Caller IDs" 中验证接收号码
2. 创建一个测试预约
3. 查看浏览器控制台确认SMS发送状态
4. 检查手机是否收到短信

## 6. 故障排除

如果SMS未发送：

1. 检查控制台错误信息
2. 确认Twilio配置正确
3. 验证接收号码已在Twilio中验证
4. 检查Twilio账户余额

## 7. Netlify部署配置

为了让SMS功能在Netlify上正常工作，需要：

### 设置环境变量:
1. 登录Netlify Dashboard
2. 进入您的站点设置
3. 找到 "Environment variables" 
4. 添加以下变量：
   - `TWILIO_ACCOUNT_SID`: AC983522c8e3a05daf29ba5b48e23f4381
   - `TWILIO_AUTH_TOKEN`: d6ce6a4b11eafdf6c311feeb86f3867b
   - `TWILIO_FROM_NUMBER`: +18334973485

### 部署文件:
确保以下文件已推送到GitHub:
- `netlify/functions/send-sms.js` (Serverless函数)
- `package.json` (依赖配置)

## 8. 当前状态

系统现在使用Netlify Functions作为后端：
- ✅ 解决了浏览器CORS限制问题
- ✅ 安全地隐藏了Twilio密钥在服务器端
- ✅ 支持发送真实SMS到验证号码

如果Netlify Function不可用，系统会：
- 显示fallback提示框
- 在控制台记录详细错误信息