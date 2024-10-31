import { createHash } from 'crypto';

export const hashPassword = (password) => {
    const sha512 = createHash('sha512');
    sha512.update(password, 'utf-8');
    const hashedPassword = sha512.digest('hex');
    
    return hashedPassword;
};
