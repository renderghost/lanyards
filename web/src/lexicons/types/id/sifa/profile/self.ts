import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from "@atcute/atproto/types/label/defs";
import * as CommunityLexiconLocationAddress from "../../../community/lexicon/location/address.js";
import * as IdSifaDefs from "../defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal("self"),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.self"),
			/**
			 * Professional summary or about section. Longer-form than Bluesky's description field.
			 * @maxLength 50000
			 * @maxGraphemes 5000
			 */
			"about": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 50000),
					/*#__PURE__*/ v.stringGraphemes(0, 5000)
				]
			)),
			/**
			 * Start of typical working hours in UTC (0-23). Used with availableToUtc for search filtering by work-hours overlap. Set via local-time UI, converted to UTC by the client.
			 * @minimum 0
			 * @maximum 23
			 */
			"availableFromUtc": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.integer(),
				[/*#__PURE__*/ v.integerRange(0, 23)]
			)),
			/**
			 * End of typical working hours in UTC (0-23). May wrap around midnight (e.g., from 22 to 06 for someone in Asia working US hours).
			 * @minimum 0
			 * @maximum 23
			 */
			"availableToUtc": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.integer(),
				[/*#__PURE__*/ v.integerRange(0, 23)]
			)),
			/**
			 * Professional-context avatar image. Overrides app.bsky.actor.profile.avatar when present.
			 * @accept image/jpeg, image/png
			 * @maxSize 1000000
			 */
			"avatar": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.blob(),
				[
					/*#__PURE__*/ v.blobSize(1000000),
					/*#__PURE__*/ v.blobAccept(["image/jpeg", "image/png"])
				]
			)),
			/**
			 * Where the professional-context avatar comes from instead of the avatar blob. 'actor.rpg.sprite' means the user's rpg.actor character: the actor.rpg.sprite record with key self in the same repository, rendered as a picture of the character. Apps that do not support the value, or find no usable record, fall back to avatar, then to app.bsky.actor.profile.avatar. Absent means use avatar. The avatar blob is kept, so removing this field brings it back.
			 * @maxLength 128
			 */
			"avatarSource": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"actor.rpg.sprite" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 128)]
			)),
			/**
			 * Client-declared timestamp when this profile was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Whether the rendered profile page may be indexed by search engines and AI tools. Default true when absent. When false, the rendering app emits noindex directives and excludes the page from any sitemap or push-indexing protocol. Does not affect the public visibility of the underlying ATproto records, which remain readable by any client.
			 */
			"discoverable": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Professional-context display name. Overrides app.bsky.actor.profile.displayName when present.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"displayName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * Family (last) name. Maps to Schema.org Person.familyName. Optional.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"familyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * Given (first) name. Maps to Schema.org Person.givenName. Optional; if absent, displayName is used for rendering.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"givenName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * Professional headline (e.g., 'Senior Engineer at Acme Corp'). Distinct from Bluesky's displayName.
			 * @maxLength 2200
			 * @maxGraphemes 220
			 */
			"headline": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2200),
					/*#__PURE__*/ v.stringGraphemes(0, 220)
				]
			)),
			/**
			 * Professional industry/domain pairs. Each entry has a required industry and optional domain refinement. Replaces the former singular industry/domain fields.
			 * @maxLength 10
			 */
			get "industries"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.industryDomainSchema),
					[/*#__PURE__*/ v.arrayLength(0, 10)]
				))
			},
			/**
			 * Self-label values for the professional profile.
			 */
			get "labels"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]))
			},
			/**
			 * BCP 47 language tags indicating the user's primary professional languages.
			 * @maxLength 3
			 */
			"langs": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString()),
				[/*#__PURE__*/ v.arrayLength(0, 3)]
			)),
			/**
			 * Professional location. Sifa enforces ISO 3166-1 alpha-2 country codes at the app layer.
			 */
			get "location"() {
				return /*#__PURE__*/ v.optional(CommunityLexiconLocationAddress.mainSchema)
			},
			/**
			 * Free-form phonetic respelling of the user's name (e.g., 'Foo-kuh'). A native professional-profile field with no app.bsky.actor.profile equivalent; extends the name fields rather than overriding anything. Text only; the spoken version lives in namePronunciationAudio.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"namePronunciation": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * Short audio clip (a few seconds) of the user saying their own name. Recorded in-app or uploaded. Complements the text respelling in namePronunciation.
			 * @accept audio/mp4, audio/mpeg, audio/ogg, audio/webm
			 * @maxSize 1048576
			 */
			"namePronunciationAudio": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.blob(),
				[
					/*#__PURE__*/ v.blobSize(1048576),
					/*#__PURE__*/ v.blobAccept([
						"audio/mp4",
						"audio/mpeg",
						"audio/ogg",
						"audio/webm"
					])
				]
			)),
			/**
			 * Types of opportunities the user is open to. Empty array or omitted means not actively seeking.
			 * @maxLength 10
			 */
			"openTo": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<"id.sifa.defs#beingMentored" | "id.sifa.defs#boardPositions" | "id.sifa.defs#collaborations" | "id.sifa.defs#commissions" | "id.sifa.defs#contractRoles" | "id.sifa.defs#fullTimeRoles" | "id.sifa.defs#mentoringOthers" | "id.sifa.defs#partTimeRoles" | "id.sifa.defs#speakingEngagements" | (string & {})>()),
				[/*#__PURE__*/ v.arrayLength(0, 10)]
			)),
			/**
			 * Preferred workplace arrangements. Orthogonal to openTo. Empty array or omitted means no preference. Prefer the scoped remote variants (remoteLocal, remoteRegion, remoteGlobal) over the generic 'remote' token.
			 * @maxLength 5
			 */
			"preferredWorkplace": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<"id.sifa.defs#hybrid" | "id.sifa.defs#onSite" | "id.sifa.defs#remote" | "id.sifa.defs#remoteGlobal" | "id.sifa.defs#remoteLocal" | "id.sifa.defs#remoteRegion" | (string & {})>()),
				[/*#__PURE__*/ v.arrayLength(0, 5)]
			)),
			/**
			 * Free-form pronouns text. Professional-context override for app.bsky.actor.profile.pronouns.
			 * @maxLength 200
			 * @maxGraphemes 20
			 */
			"pronouns": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 200),
					/*#__PURE__*/ v.stringGraphemes(0, 20)
				]
			)),
			/**
			 * Whether the rendering app shows the user's activity in other ATproto apps (records the user creates in collections outside this namespace) on their profile and in activity feeds. Default true when absent. When false, the rendering app hides all of that activity, including activity from apps it starts to recognize in the future. Any per-app display choices the rendering app keeps stay as they are and apply again when this is true. Does not affect the public visibility of the underlying ATproto records, which remain readable by any client.
			 */
			"showActivity": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.self": mainSchema;
	}
}
