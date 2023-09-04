import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user';
import { createTokens, removeToken } from '../utils/jwt';
import RefreshToken from '../models/refreshToken';
import { MoreThan } from 'typeorm';
import { RefreshPayload } from '../types/payload';

class AuthController {
	/** Login user and send tokens. */
	static login = async (req: Request, res: Response) => {
		// Login data from body
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).send('Username and password are required');
		}

		// Find user by username or email
		let user: User;
		try {
			user = await User.findOneOrFail({
				where: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
			});
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Incorrect username' : 'Incorrect username or password');
		}

		// Check password
		if (!user.checkPassword(password)) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Incorrect password' : 'Incorrect username or password');
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			return res.status(500).send();
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

		// Return user without sensitive information
		const { password: pass, ...retData } = user;
		res.send(retData);
	};

	/** Refresh tokens and send new ones. */
	static refresh = async (req: Request, res: Response) => {
		// Control (non-http-only) token from cookies
		const controlToken = req.cookies.control_token;

		// Refresh token from cookies
		const refreshToken = req.cookies.refresh_token;

		// If there is no control token, complete unfinished logout and return error status
		if (!controlToken) {
			// Remove refresh token from database
			removeToken(refreshToken);

			// Delete cookies from client
			res.cookie('access_token', '', { maxAge: 1 });
			res.cookie('refresh_token', '', { maxAge: 1 });
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'No control token' : '');
		}

		// If there is no refresh token, the request is unauthorized
		if (!refreshToken) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'No refresh token' : '');
		}

		// Validate control token
		try {
			jwt.verify(controlToken, process.env.REFRESH_TOKEN_SECRET);
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Invalid control token' : '');
		}

		// Validate refresh token
		let refreshPayload: RefreshPayload;
		try {
			refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as RefreshPayload;
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Invalid refresh token' : '');
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { id: refreshPayload.idUser } });
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'User not found' : '');
		}

		// Verify that the refresh token is in database and remove it
		// Double check validity
		let refreshTokenRecord: RefreshToken;
		try {
			const expirationTime = Math.round(new Date().getTime() / 1000);
			refreshTokenRecord = await RefreshToken.findOneOrFail({
				where: { idUser: refreshPayload.idUser, token: refreshPayload.token, expires: MoreThan(expirationTime) }
			});
			refreshTokenRecord.remove();
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Refresh token not found' : '');
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Unexpected error while creating tokens' : '');
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
		const refreshToken = req.cookies.refresh_token;

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
