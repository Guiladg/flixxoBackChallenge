export interface Payload {
	id: number;
	username: string;
	role: string;
}

export interface RefreshPayload {
	idUser: number;
	token: string;
}
