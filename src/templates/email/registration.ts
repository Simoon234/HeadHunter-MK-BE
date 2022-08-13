import { ACTIVATION_HR_URL, ACTIVATION_STUDENT_URL } from '../../../config';

const message = (link: string, id: string, token: string) => `
    <h2> Hi there! </h2>
    <p> Thank you for signing up for our megaKApp
    To get you started, please click on the button below to log in to your account for the first time. </p>
    
    <a href="${link}/${id}/${token}">I'm here! 👋</a>
    
    <p> If you didn’t submit your email address to join our subscriber list, please ignore this message. </p>
    
    <p>Regards,
    The megaKApp support team</p>
`;

export const registerUser = (id: string, token: string) =>
  message(ACTIVATION_STUDENT_URL, id, token);

export const registerHr = (id: string, token: string) =>
  message(ACTIVATION_HR_URL, id, token);
