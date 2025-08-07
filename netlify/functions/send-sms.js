const twilio = require('twilio');

exports.handler = async (event, context) => {
  console.log('收到SMS请求:', event.httpMethod);
  
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    console.log('请求体:', event.body);
    const { to, message } = JSON.parse(event.body);
    
    if (!to || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: '缺少必需参数: to 和 message' 
        })
      };
    }

    // Twilio配置 - 优先使用环境变量，然后使用硬编码
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC983522c8e3a05daf29ba5b48e23f4381';
    const authToken = process.env.TWILIO_AUTH_TOKEN || 'd6ce6a4b11eafdf6c311feeb86f3867b';
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '+18334973485';
    
    console.log('使用的凭据来源:');
    console.log('- AccountSid:', process.env.TWILIO_ACCOUNT_SID ? '环境变量' : '硬编码');
    console.log('- AuthToken:', process.env.TWILIO_AUTH_TOKEN ? '环境变量' : '硬编码');

    console.log('Twilio配置:');
    console.log('- AccountSid:', accountSid.substring(0, 10) + '...');
    console.log('- FromNumber:', fromNumber);
    console.log('- ToNumber:', to);
    
    const client = twilio(accountSid, authToken);

    // 发送SMS
    console.log('开始发送SMS...');
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    console.log('✅ SMS发送成功:', result.sid);
    console.log('状态:', result.status);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        messageSid: result.sid,
        status: result.status,
        to: to
      })
    };

  } catch (error) {
    console.error('❌ SMS发送失败:', error);
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN',
        details: error.moreInfo || '无更多信息'
      })
    };
  }
};