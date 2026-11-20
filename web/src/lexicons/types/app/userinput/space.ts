import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.userinput.space"),
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * @maxLength 3000
			 * @maxGraphemes 1500
			 */
			"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 3000),
					/*#__PURE__*/ v.stringGraphemes(0, 1500)
				]
			)),
			/**
			 * Optional space icon/logo.
			 * @accept image/jpeg, image/png, image/webp
			 * @maxSize 1000000
			 */
			"icon": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.blob(),
				[
					/*#__PURE__*/ v.blobSize(1000000),
					/*#__PURE__*/ v.blobAccept(["image/jpeg", "image/png", "image/webp"])
				]
			)),
			/**
			 * @maxLength 200
			 * @maxGraphemes 100
			 */
			"name": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 200),
					/*#__PURE__*/ v.stringGraphemes(0, 100)
				]
			),
			/**
			 * The set of categories feedback in this space may be filed under.
			 * @maxLength 24
			 */
			get "tags"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(tagSchema),
					[/*#__PURE__*/ v.arrayLength(0, 24)]
				))
			},
		}
	)
);
const _tagSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("app.userinput.space#tag")),
		/**
		 * Human-readable display label.
		 * @maxLength 64
		 */
		"label": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[/*#__PURE__*/ v.stringLength(0, 64)]
		),
		/**
		 * Stable machine value stored on discussions.
		 * @maxLength 64
		 */
		"value": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[/*#__PURE__*/ v.stringLength(0, 64)]
		),
	}
);
type main$schematype = typeof _mainSchema;
type tag$schematype = typeof _tagSchema;

export interface mainSchema extends main$schematype {}

export interface tagSchema extends tag$schematype {}
export const mainSchema = _mainSchema as mainSchema;
export const tagSchema = _tagSchema as tagSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

export interface Tag extends v.InferInput<typeof tagSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"app.userinput.space": mainSchema;
	}
}
