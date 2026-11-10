import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.lanyards.link.media.video"),
			/**
			 * Timestamp when this link was added
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Description of the video content
			 * @maxLength 1000
			 */
			"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 1000)]
			)),
			/**
			 * Video duration in seconds
			 */
			"duration": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Video hosting platform
			 */
			"platform": /*#__PURE__*/ v.literalEnum([
				"other",
				"tiktok",
				"twitch",
				"vimeo",
				"youtube"
			]),
			/**
			 * Date the video was published
			 */
			"publishedDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * Optional AT-URI reference to related work record
			 */
			"relatedWork": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/**
			 * Video title
			 * @maxLength 200
			 */
			"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 200)]
			)),
			/**
			 * Type of video content
			 */
			"type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum([
				"conference-talk",
				"interview",
				"lecture",
				"other",
				"presentation",
				"tutorial"
			])),
			/**
			 * URL to the video
			 */
			"url": /*#__PURE__*/ v.genericUriString(),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"app.lanyards.link.media.video": mainSchema;
	}
}
