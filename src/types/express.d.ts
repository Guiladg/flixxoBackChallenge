import { Payload } from './payload';

// Avoid the TypeScript error
export {};

// Add payload to Express Request object
declare namespace Express {
	interface Request {
		jwtPayload?: Payload;
	}
}
