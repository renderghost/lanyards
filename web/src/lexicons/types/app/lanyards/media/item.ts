import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.lanyards.media.item"),
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * @maxLength 1000
			 */
			"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 1000)]
			)),
			/**
			 * Length in seconds
			 * @minimum 0
			 */
			"duration": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Audio or video
			 * @maxLength 32
			 */
			"kind": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"audio" | "video" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 32)]
			),
			/**
			 * Where it is hosted
			 * @maxLength 64
			 */
			"platform": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"anchor" | "apple-podcasts" | "other" | "soundcloud" | "spotify" | "tiktok" | "twitch" | "vimeo" | "youtube" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 64)]
			)),
			/**
			 * When it was published
			 */
			"publishedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * A related Sifa presentation or publication
			 */
			"related": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/**
			 * The podcast or series it belongs to
			 * @maxLength 200
			 */
			"seriesName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 200)]
			)),
			/**
			 * Episode or video title
			 * @maxLength 200
			 */
			"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 200)]
			)),
			/**
			 * What kind of appearance it is
			 * @maxLength 64
			 */
			"type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"interview" | "other" | "panel-discussion" | "podcast-episode" | "tutorial" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 64)]
			)),
			"updatedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * Where to listen or watch
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
		"app.lanyards.media.item": mainSchema;
	}
}
