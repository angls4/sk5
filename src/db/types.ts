import type { ColumnType } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Doc = {
	id: Generated<number>;
	name: string;
	groupId: Generated<number>;
};
export type DocFile = {
	id: Generated<number>;
	dateCreated: Generated<Timestamp>;
	docId: number;
	name: string;
	userId: string;
	isActive: Generated<number>;
	fileType: string | null;
};
export type Group = {
	id: Generated<number>;
	name: string;
	parentId: number;
};
export type Key = {
	id: string;
	hashed_password: string | null;
	user_id: string;
};
export type Session = {
	id: string;
	user_id: string;
	active_expires: number;
	idle_expires: number;
};
export type User = {
	id: string;
	name: string;
	phone_number: string;
};
export type DB = {
	Doc: Doc;
	DocFile: DocFile;
	Group: Group;
	Key: Key;
	Session: Session;
	User: User;
};
