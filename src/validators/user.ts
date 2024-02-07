import { IsNotEmpty, Length } from 'class-validator';

/** For using as validation schema on user login. */
export class UserLoginValidationSchema {
	@Length(4, 320) // Checks username (max 20 chars) or email (max 320 chars)
	@IsNotEmpty()
	username: string;

	@Length(4, 20)
	@IsNotEmpty()
	password: string;
}
