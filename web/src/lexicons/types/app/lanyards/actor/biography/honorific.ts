import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal("self"),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.lanyards.actor.biography.honorific"),
			/**
			 * Timestamp when this record was created
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Timestamp when this record was last updated
			 */
			"updatedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * Academic honorific - one of: none, Dr, or Prof (tradition: use one or the other, never both)
			 */
			"value": /*#__PURE__*/ v.literalEnum(["Dr", "Prof", "none"]),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"app.lanyards.actor.biography.honorific": mainSchema;
	}
}
