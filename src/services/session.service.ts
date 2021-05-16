import jwt from 'jsonwebtoken'; 
import { randomBytes } from 'crypto';
import argon2 from 'argon2';
import { IUser, IUserInputDTO } from '../interfaces'; 
import { UserService } from '../services'; 
import { UserDA } from '../da'; 
import config from '../config';
 
export class SessionService {
  constructor(private userda: UserDA ) { }

  // Login service  
  public async SignIn(email: string, password: string): Promise<{ token: string }> {

      console.log('Sign in service email:' + email);
      
      const userService = new UserService(this.userda);

      // User from db
	    const user = await userService.GetUser(email); 

	    // Check if exists
	    if (!user) {
	      throw new Error('User not registered');
	    } 

	    // Verify password using salt
      console.log('Password argon2 ' + user.password);
	    const validPassword = await argon2.verify(user.password, password);
        console.log('Password argon22');
	    if (validPassword) {

        // Valid password
	      console.log('Password is valid');

	      // Generate token
	      console.log('Generate JWT');
	      const token = this.generateToken(user);

        // Delete sensible data
        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');

	      // Return token 
	      return { token };
        
	    } else {
	      throw new Error('Invalid Password');
	    }
  }

  public generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
 
    console.log(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      config.JWT_SECRET
    );
  }
}
