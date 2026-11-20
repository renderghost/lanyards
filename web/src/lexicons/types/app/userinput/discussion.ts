import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoStrongRef from "@atcute/atproto/types/repo/strongRef";

const _imageSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("app.userinput.discussion#image")),
		/**
		 * @maxLength 2000
		 */
		"alt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[/*#__PURE__*/ v.stringLength(0, 2000)]
		)),
		/**
		 * @accept image/gif, image/jpeg, image/png, image/webp
		 * @maxSize 1000000
		 */
		"image": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.blob(),
			[
				/*#__PURE__*/ v.blobSize(1000000),
				/*#__PURE__*/ v.blobAccept([
					"image/gif",
					"image/jpeg",
					"image/png",
					"image/webp"
				])
			]
		),
	}
);
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.userinput.discussion"),
			/**
			 * @maxLength 20000
			 * @maxGraphemes 10000
			 */
			"body": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 20000),
					/*#__PURE__*/ v.stringGraphemes(0, 10000)
				]
			)),
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Optional image attachments.
			 * @maxLength 4
			 */
			get "images"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(imageSchema),
					[/*#__PURE__*/ v.arrayLength(0, 4)]
				))
			},
			/**
			 * Strong reference to the app.userinput.space this belongs to. Indexed by constellation at space.uri.
			 */
			get "space"() {
				return ComAtprotoRepoStrongRef.mainSchema
			},
			/**
			 * Tag values drawn from the space's tag list.
			 * @maxLength 8
			 */
			"tags": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.string(),
					[/*#__PURE__*/ v.stringLength(0, 64)]
				)),
				[/*#__PURE__*/ v.arrayLength(0, 8)]
			)),
			/**
			 * @maxLength 600
			 * @maxGraphemes 300
			 */
			"title": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 600),
					/*#__PURE__*/ v.stringGraphemes(0, 300)
				]
			),
		}
	)
);
type image$schematype = typeof _imageSchema;
type main$schematype = typeof _mainSchema;

export interface imageSchema extends image$schematype {}

export interface mainSchema extends main$schematype {}
export const imageSchema = _imageSchema as imageSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Image extends v.InferInput<typeof imageSchema> {}

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"app.userinput.discussion": mainSchema;
	}
}
