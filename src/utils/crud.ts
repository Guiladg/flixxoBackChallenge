import dataSource from '../DB';
import NotFoundError from '../errors/NotFoundError';
import DataBaseError from '../errors/DataBaseError';
import { Attributes, CreationAttributes, FindOptions, Model, WhereOptions } from 'sequelize';
import DB from '../DB';
import { Constructor } from '../types/constructor';

/** Entity field as literals */
export type Field<E extends Model> = keyof Attributes<E>;

/** Posible CRUD operations */
export type CrudOperation = 'create' | 'update' | 'delete';

/** Every crudRecord Fn options posible */
export interface AllCrudOptions<E extends Model> {
	fields?: Field<E>[];
	data: Partial<Attributes<E>>;
	idField?: Field<E>;
}
/** When creating, crudRecord Fn options are just fields and data */
export interface CreateCrudOptions<E extends Model> extends Omit<AllCrudOptions<E>, 'idField'> {
	data: CreationAttributes<E>;
}
/** When updating, crudRecord Fn options are all of them. */
export interface UpdateCrudOptions<E extends Model> extends AllCrudOptions<E> {}
/** When deleting, crudRecord Fn options are just data, idField and softDelete */
export interface DeleteCrudOptions<E extends Model> extends Omit<AllCrudOptions<E>, 'fields'> {}

export type CrudOptions<O extends CrudOperation, E extends Model> = O extends 'create'
	? CreateCrudOptions<E>
	: O extends 'delete'
	? DeleteCrudOptions<E>
	: UpdateCrudOptions<E>;

/** Executes a CRUD operations according to options.
 * @param options.operation The type of operation to execute.
 * @param options.fields The fields of the new or updated entity to fill with the values in `data`. If not provided, every field in `data` and in the entity will be filled.
 * @param options.data Object containing the values to fill the new or updated entity. Also, if needed, includes the primary key value.
 * @param options.idField The field that acts as primary key column. If not provided, `id` will be used.
 */
export async function crudRecord<Operation extends CrudOperation, Entity extends Model>(
	operation: Operation,
	entity: Constructor<Entity>,
	options: CrudOptions<Operation, Entity>
): Promise<Entity> {
	// Parameters (as AllCrudOptions for avoiding "property does not exist on type")
	const { data, fields, idField } = options as AllCrudOptions<Entity>;
	// If idField is not specified, use 'id'
	const _idField = (idField ?? 'id') as keyof Entity;

	// Temp record
	let record: Entity;

	if (operation === 'create') {
		// Create temp record
		record = new entity();
	} else {
		// Find record by id
		const where = { [_idField]: data[_idField] } as WhereOptions<Entity>;
		// Prevent TS from "Property 'findOne' does not exist on type 'Constructor<Entity>'". Entity extends Model, so findOne does exists.
		record = await (entity as any).findOne({ where });

		if (!record) {
			throw new NotFoundError({ message: 'Record not found on DB.' });
		}
	}

	if (operation !== 'delete') {
		// Fill record with data (fields can be enumerated or leave it automatic)
		if (fields != undefined) {
			for (const field of fields) {
				record[field] = data[field];
			}
		} else {
			for (const field in data) {
				field in record && (record[field] = data[field]);
			}
		}
	}

	// try to Delete/Save record
	try {
		if (operation === 'delete') {
			await record.destroy();
		} else {
			await record.save();
		}
	} catch (cause) {
		throw new DataBaseError({ message: cause.message, cause });
	}

	return record;
}

/** Executes a create database operation according to options.
 * @param options.fields The fields of the new or updated entity to fill with the values in `data`. If not provided, every field in `data` and in the entity will be filled.
 * @param options.data Object containing the values to fill the new or updated entity.
 */
export async function createRecord<Entity extends Model>(entity: Constructor<Entity>, options: CreateCrudOptions<Entity>): Promise<Entity> {
	return crudRecord('create', entity, options);
}

/** Executes an update database operation according to options.
 * @param options.fields The fields of the new or updated entity to fill with the values in `data`. If not provided, every field in `data` and in the entity will be filled.
 * @param options.data Object containing the values to fill the new or updated entity.
 * @param options.idField The field that acts as primary column. If not provided, `id` will be used.
 */
export async function updateRecord<Entity extends Model>(entity: Constructor<Entity>, options: UpdateCrudOptions<Entity>): Promise<Entity> {
	return crudRecord('update', entity, options);
}

/** Executes a delete database operation according to options.
 * @param options.idField The field that acts as primary column. If not provided, `id` will be used.
 * @param options.data Object containing the values to fill the new or updated entity.
 */
export async function deleteRecord<Entity extends Model>(entity: Constructor<Entity>, options: DeleteCrudOptions<Entity>): Promise<Entity> {
	return crudRecord('delete', entity, options);
}
