export const resetPassword = (
  name: string,
  id: string,
  refreshToken: string,
) => {
  return `
        <h1>Hi ${name}</h1>
        <p>Forgot your password?</p>
        <p>We recived a request to reset the password for your account</p>
        <p>To reset the password click link down below</p>
        <a href="http://localhost:3000/password-reset/${id}/${refreshToken}">Reset password</a>
    `;
};
