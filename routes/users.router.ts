/**
 * Required External Modules and Interfaces
 */
import express, { Request, Response } from "express";
import * as UserService from "../services/users.service";
import { OktaUser } from "../interfaces/user.interface";
import { UserDocument } from "../models/users.model";
import oktaClient from '../authentication/oktaClient';
import { authenticationRequired } from '../authentication/authentication';

export const usersRouter = express.Router();

usersRouter.post('/user', authenticationRequired, async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user: UserDocument[] = await UserService.findUserByEmail(email);
    if (user.length === 0) {
      throw new Error('User not found!');
    }
    return res.status(201).json(...user);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

usersRouter.post('/', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    const err = new Error('Missing user information');
    return res.status(500).json(err.message);
  }

  const userMatch: UserDocument[] = await UserService.findUserByEmail(email);
  if (userMatch.length > 0) {
    const err = new Error('User with this email already exists!');
    return res.status(400).json(err.message);
  }

  try {
    const oktaUser: OktaUser = {
      profile: {
        firstName,
        lastName,
        email,
        login: email,
      },
      credentials: {
        password: {
          value: password,
        },
      },
    };
    const oktaResponse = await oktaClient.createUser(oktaUser);
    const newUser = {
      userId: oktaResponse.id,
      firstName: oktaResponse.profile.firstName,
      lastName: oktaResponse.profile.lastName,
      email: oktaResponse.profile.email,
    };
    const dbUser = await UserService.createUser(newUser);
    return res.status(201).json(dbUser);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.errorCauses[0].errorSummary);
  }
});
