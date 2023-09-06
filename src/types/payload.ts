export interface Payload {
	id: number;
	username: string;
	role: string;
}

export interface RefreshPayload {
	idUser: number;
	token: string;
}

declare module 'express-serve-static-core' {
	interface Request {
		jwtPayload?: Payload;
	}
}
