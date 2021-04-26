import { BaseUser } from "../interfaces/user.interface";
import User from '../models/users.model';

export const findUserByEmail = (email: string) => User.find({ email });

export const createUser = (user: BaseUser) => new User(user).save();
