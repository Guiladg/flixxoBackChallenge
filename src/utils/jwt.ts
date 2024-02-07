import User from '../models/user';
import * as jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken';
import { Payload, RefreshPayload } from '../types/payload';
import { randomBytes } from 'crypto';
import DataBaseError from '../errors/DataBaseError';

/** Returns a tuple with access, refresh and control tokens. Saves the second one in database, related to user. */
export function createTokens(user: User): [string, string, string] {
	const payload: Payload = { username: user.username, role: user.role, id: user.id };
	// Create new refresh token
	const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.ACCESS_TOKEN_LIFE)
	});

	// Create random string to be used as refresh token identifier
	const token = randomBytes(16).toString('base64url');
	const refreshPayload: RefreshPayload = { idUser: user.id, token };
	const newRefreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
	});

	// Create new empty token for non-http-only use (for logout offline purpose)
	const newControlToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
	});

	// Save refresh token in database
	const refreshTokenRecord = new RefreshToken();
	refreshTokenRecord.user = user;
	refreshTokenRecord.token = token;
	refreshTokenRecord.expires = Math.round(new Date().getTime() / 1000) + Number(process.env.REFRESH_TOKEN_LIFE);
	try {
		refreshTokenRecord.save();
	} catch (cause) {
		throw new DataBaseError({ message: cause.message, cause });
	}

	return [newAccessToken, newRefreshToken, newControlToken];
}

/** Synchronously verifies the provided JWT `token` against the one defined on `type` and returns the payload or throws an error. */
export function verifyToken<T extends 'access' | 'refresh' | 'control'>(type: T, token: string): T extends 'access' ? Payload : RefreshPayload {
	const against = type === 'access' ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
	return jwt.verify(token, against, { algorithms: ['HS256'] }) as any;
}

/** Removes a refresh token from the database. */
export const removeToken = async (refreshToken: string) => {
	try {
		const { idUser, token } = verifyToken('refresh', refreshToken);
		const refreshTokenRecord = await RefreshToken.findOne({ where: { user: { id: idUser }, token } });
		if (refreshTokenRecord) {
			refreshTokenRecord.remove();
		}
	} catch (error) {
		// Just avoid nodejs crashing
	}
};
