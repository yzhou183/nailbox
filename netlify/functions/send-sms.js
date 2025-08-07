const twilio = require('twilio');

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, message } = JSON.parse(event.body);

    // Twilio配置 - 在Netlify环境变量中设置
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC983522c8e3a05daf29ba5b48e23f4381';
    const authToken = process.env.TWILIO_AUTH_TOKEN || 'eceec63f6b5c1300fe026a9f959f7663';
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '+18334973485';

    const client = twilio(accountSid, authToken);

    // 发送SMS
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    console.log('SMS发送成功:', result.sid);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        messageSid: result.sid,
        to: to
      })
    };

  } catch (error) {
    console.error('SMS发送失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};