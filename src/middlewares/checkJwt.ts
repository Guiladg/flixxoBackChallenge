import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Payload } from '../types/payload';

export interface JwtMiddlewareOptions {
	allowPublic?: boolean;
	req: Request;
	res: Response;
	next: NextFunction;
}

/** Check if JWT tokens are valid. If `allowPublic` option is true, the non-provided-token errors are bypassed.  */
export function jwtMiddleware({ allowPublic, req, res, next }: JwtMiddlewareOptions) {
	// Control (non-http-only) token from cookies
	const controlToken = req.cookies.control_token;

	// Access token from cookies
	const accessToken = req.cookies.access_token;

	// If public requests are allowed and no tokens are provided, continue to next middleware
	if (allowPublic && !controlToken && !accessToken) {
		return next();
	}

	// If there are no tokens, the request is unauthorized
	if (!controlToken) {
		return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'No control token' : '');
	}
	if (!accessToken) {
		return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'No access token' : '');
	}

	// Validate control token
	try {
		jwt.verify(controlToken, process.env.REFRESH_TOKEN_SECRET);
	} catch (error) {
		return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Invalid control token' : '');
	}

	// Validate access token
	let payload: Payload;
	try {
		payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET) as Payload;
	} catch (error) {
		return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Invalid access token' : '');
	}

	// Saves payload for next middlewares
	req.jwtPayload = payload;

	// Next middleware
	next();
}

/** Check if JWT tokens are valid. Public requests are not allowed.  */
export function checkJwt(req: Request, res: Response, next: NextFunction) {
	jwtMiddleware({ req, res, next });
}

/** Check if JWT tokens are valid. Public requests are allowed.  */
export function checkJwtAllowPublic(req: Request, res: Response, next: NextFunction) {
	jwtMiddleware({ allowPublic: true, req, res, next });
}
