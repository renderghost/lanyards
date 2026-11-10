import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as IdSifaDefs from "../defs.js";

const _durationSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.profile.presentation#duration")),
		/**
		 * Upper bound in minutes when the length is offered as a range. Omit for a fixed length.
		 * @minimum 1
		 */
		"maxMinutes": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.integer(),
			[/*#__PURE__*/ v.integerRange(1)]
		)),
		/**
		 * Length in minutes, or the lower bound when the length is offered as a range.
		 * @minimum 1
		 */
		"minMinutes": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.integer(),
			[/*#__PURE__*/ v.integerRange(1)]
		),
	}
);
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.presentation"),
			/**
			 * Optional cover image for the presentation. Rendered as the talk-page hero and OpenGraph image. Max 2 MB, PNG, JPEG, or WebP.
			 * @accept image/jpeg, image/png, image/webp
			 * @maxSize 2000000
			 */
			"coverImage": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.blob(),
				[
					/*#__PURE__*/ v.blobSize(2000000),
					/*#__PURE__*/ v.blobAccept(["image/jpeg", "image/png", "image/webp"])
				]
			)),
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Description or abstract of the presentation.
			 * @maxLength 50000
			 * @maxGraphemes 5000
			 */
			"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 50000),
					/*#__PURE__*/ v.stringGraphemes(0, 5000)
				]
			)),
			/**
			 * Typical length of the presentation, a fixed value or a range, in minutes.
			 */
			get "duration"() {
				return /*#__PURE__*/ v.optional(durationSchema)
			},
			/**
			 * Intended audiences for this presentation, open text (e.g. 'Engineering leaders', 'Beginners').
			 * @maxLength 20
			 */
			"intendedAudiences": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.string(),
					[
						/*#__PURE__*/ v.stringLength(0, 1000),
						/*#__PURE__*/ v.stringGraphemes(0, 100)
					]
				)),
				[/*#__PURE__*/ v.arrayLength(0, 20)]
			)),
			/**
			 * Whether this is the user's primary talk, surfaced in profile Highlights. Only reusable talks (not one-off sessions) may be primary.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Canonical links for this content, such as slides or a recording.
			 * @maxLength 20
			 */
			get "links"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.presentationLinkSchema),
					[/*#__PURE__*/ v.arrayLength(0, 20)]
				))
			},
			/**
			 * Title of the presentation.
			 * @minLength 1
			 * @maxLength 3000
			 * @maxGraphemes 300
			 */
			"title": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 3000),
					/*#__PURE__*/ v.stringGraphemes(0, 300)
				]
			),
			/**
			 * Optional reference to a long-form write-up of this presentation (a pub.leaflet.document or site.standard.document holding video, transcript, or article).
			 */
			get "writeupRef"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.externalRecordRefSchema)
			},
		}
	)
);
type duration$schematype = typeof _durationSchema;
type main$schematype = typeof _mainSchema;

export interface durationSchema extends duration$schematype {}

export interface mainSchema extends main$schematype {}
export const durationSchema = _durationSchema as durationSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Duration extends v.InferInput<typeof durationSchema> {}

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.presentation": mainSchema;
	}
}
