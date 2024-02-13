import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { createTokens, removeToken } from '../utils/jwt';
import RefreshToken from '../models/refreshToken';
import { RefreshPayload } from '../types/payload';
import { ClientRecord } from '../types/client';
import User from '../models/user';
import { Op } from 'sequelize';

class AuthController {
	/** Login user and send tokens. */
	static login = async (req: Request, res: Response) => {
		// Login data from body
		const { username, password } = req.body;

		// Find user by username or email
		const user = await User.findOne({
			where: { [Op.or]: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] }
		});
		if (!user) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Incorrect username' : 'Incorrect username or password' });
		}

		// Check password
		if (!(await user.checkPassword(password))) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Incorrect password' : 'Incorrect username or password' });
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			// Return errors with code and message if exists
			res.status(error?.status ?? 500).send(error?.message ?? '');
		}

		// Send tokens to the client inside cookies
		// HTTP-only cookies for access and refresh tokens
		res.cookie('access_token', newAccessToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});
		// Regular cookie for access control token
		res.cookie('control_token', newControlToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: false,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});

		// Set in record user without sensitive information
		const { password: pass, ...record } = user.dataValues;

		// Create return to client object
		const ret: ClientRecord = {
			record,
			message: 'Login Ok'
		};

		// Return 200 and the user data
		res.status(200).json(ret);
	};

	/** Refresh tokens and send new ones. */
	static refresh = async (req: Request, res: Response) => {
		// Control (non-http-only) token from cookies
		const controlToken: string = req.cookies.control_token;

		// Refresh token from cookies
		const refreshToken: string = req.cookies.refresh_token;

		// If there is no control token, complete unfinished logout and return error status
		if (!controlToken) {
			// Remove refresh token from database
			removeToken(refreshToken);

			// Delete cookies from client
			res.cookie('access_token', '', { maxAge: 1 });
			res.cookie('refresh_token', '', { maxAge: 1 });
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'No control token' : '' });
		}

		// If there is no refresh token, the request is unauthorized
		if (!refreshToken) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'No refresh token' : '' });
		}

		// Validate control token
		try {
			jwt.verify(controlToken, process.env.REFRESH_TOKEN_SECRET);
		} catch (error) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Invalid control token' : '' });
		}

		// Validate refresh token
		let refreshPayload: RefreshPayload;
		try {
			refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as RefreshPayload;
		} catch (error) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Invalid refresh token' : '' });
		}

		// Get user
		const user = await User.findOne({ where: { id: refreshPayload.idUser } });
		if (!user) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'User not found' : '' });
		}

		// Verify that the refresh token is in database and remove it
		// Double check validity
		const expirationTime = Math.round(new Date().getTime() / 1000);
		const { idUser, token } = refreshPayload;
		const refreshTokenRecord = await RefreshToken.findOne({
			where: {
				userId: idUser,
				token,
				expires: { [Op.gt]: expirationTime }
			}
		});
		if (!refreshTokenRecord) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Refresh token not found' : '' });
		}
		refreshTokenRecord.destroy();

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			return res.status(401).json({ message: process.env.NODE_ENV !== 'production' ? 'Unexpected error while creating tokens' : '' });
		}

		// Send new tokens to the client inside cookies
		// HTTP-only cookies for access and refresh tokens
		res.cookie('access_token', newAccessToken, {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: process.env.NODE_ENV === 'production',
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: process.env.NODE_ENV === 'production',
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});
		// Regular cookie for access control token
		res.cookie('control_token', newControlToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: false,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});

		res.send();
	};

	/** Logout user and delete tokens. */
	static logout = async (req: Request, res: Response) => {
		// Refresh token from cookies
		const refreshToken: string = req.cookies.refresh_token;

		// Remove refresh token from database
		removeToken(refreshToken);

		// Delete cookies from client
		res.cookie('access_token', '', { maxAge: 1 });
		res.cookie('refresh_token', '', { maxAge: 1 });
		res.cookie('control_token', '', { maxAge: 1 });
		res.send();
	};
}
export default AuthController;
