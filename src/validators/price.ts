import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

/** For using as validation schema on price creation. */
export class PriceCreateValidationSchema {
	@IsNotEmpty()
	@IsNumber()
	value: number;

	@IsDateString()
	@IsOptional()
	date: Date;
}

/** For using as validation schema on price update. */
export class PriceUpdateValidationSchema {
	@IsNumber()
	@IsOptional()
	value: number;

	@IsDateString()
	@IsOptional()
	date: Date;
}
