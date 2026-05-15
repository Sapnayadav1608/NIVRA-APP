// Simple console-based email service for development
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:3002/reset-password/${resetToken}`;
  
  console.log('\n🔐 PASSWORD RESET REQUEST');
  console.log(`📧 Email: ${email}`);
  console.log(`🔗 Reset Link: ${resetUrl}`);
  console.log('⏰ Valid for 10 minutes');
  console.log('================================\n');
  
  return { success: true, resetUrl };
};

module.exports = {
  sendPasswordResetEmail
};