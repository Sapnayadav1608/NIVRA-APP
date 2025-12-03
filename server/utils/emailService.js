// Simple console-based email service for development
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  console.log('\n=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('============================\n');
  
  return true;
};

module.exports = {
  sendPasswordResetEmail
};