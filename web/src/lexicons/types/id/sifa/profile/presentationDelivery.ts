import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as CommunityLexiconLocationAddress from "../../../community/lexicon/location/address.js";
import * as IdSifaDefs from "../defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.presentationDelivery"),
			/**
			 * Structured delivery location. Sifa enforces ISO 3166-1 alpha-2 country codes at the app layer and surfaces country (for a flag) and locality (city); region, postalCode, and street are unused for deliveries. Takes precedence over the legacy location string when present.
			 */
			get "address"() {
				return /*#__PURE__*/ v.optional(CommunityLexiconLocationAddress.mainSchema)
			},
			/**
			 * DIDs of co-speakers who presented alongside the author at this occasion. Any atproto account is allowed; hydrated to profile cards on read and linked to the co-speaker's Sifa profile.
			 * @maxLength 20
			 */
			"coSpeakers": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
				[/*#__PURE__*/ v.arrayLength(0, 20)]
			)),
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Calendar date of this delivery as YYYY-MM-DD, or YYYY-MM or YYYY when the exact day or month is not known (no time). Future dates are allowed for upcoming deliveries. The shape is enforced at the app layer. On the linked branch, derived from the event's startsAt in the event's own offset, and always a full day.
			 * @maxLength 10
			 */
			"date": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[/*#__PURE__*/ v.stringLength(0, 10)]
			)),
			/**
			 * Name of the event or venue. On the linked branch, hydrated from the calendar event's name.
			 * @maxLength 3000
			 * @maxGraphemes 300
			 */
			"eventName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 3000),
					/*#__PURE__*/ v.stringGraphemes(0, 300)
				]
			)),
			/**
			 * Optional reference to a community.lexicon.calendar.event for this occasion. Display fields are hydrated live from the target by AT-URI, with the stored fields as a fallback when the target is unavailable.
			 */
			get "eventRef"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.externalRecordRefSchema)
			},
			/**
			 * Links specific to this delivery, such as the recording of this occasion.
			 * @maxLength 20
			 */
			get "links"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.presentationLinkSchema),
					[/*#__PURE__*/ v.arrayLength(0, 20)]
				))
			},
			/**
			 * Legacy free-text display location (city, country, or venue), retained for dual-read. Prefer the structured address field. On the linked branch, composed from the calendar event's structured locations.
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"location": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * Whether this delivery was in person, virtual, or hybrid. Stores the full community.lexicon.calendar.event mode token; absent means in person.
			 */
			"mode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"community.lexicon.calendar.event#hybrid" | "community.lexicon.calendar.event#inperson" | "community.lexicon.calendar.event#virtual" | (string & {})>()),
			/**
			 * Optional reference to the id.sifa.profile.presentation (the content) delivered here. When set, title, duration, and audiences are taken from it.
			 */
			get "presentationRef"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.externalRecordRefSchema)
			},
			/**
			 * The presenter's role in this delivery. Open set; see id.sifa.defs#presentationRole.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"id.sifa.defs#host" | "id.sifa.defs#keynote" | "id.sifa.defs#panelist" | "id.sifa.defs#presenter" | "id.sifa.defs#workshop" | (string & {})>(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * The same session as recorded on another person's profile. Set when you keep your own entry for work someone else has also recorded, so consumers can tell the two describe one thing rather than showing it twice. Each side stays its own record: the other person cannot edit yours, and yours does not change theirs. Resolve by AT-URI, since they will keep editing their copy.
			 */
			get "sameAs"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.externalRecordRefSchema)
			},
			/**
			 * Scheduling status of this delivery, typically hydrated from a linked calendar event. Stores the full community.lexicon.calendar.event status token. Consumers should surface cancelled and postponed states.
			 */
			"status": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"community.lexicon.calendar.event#cancelled" | "community.lexicon.calendar.event#planned" | "community.lexicon.calendar.event#postponed" | "community.lexicon.calendar.event#rescheduled" | "community.lexicon.calendar.event#scheduled" | (string & {})>()),
			/**
			 * Fallback title for this delivery, used when no presentationRef is set.
			 * @maxLength 3000
			 * @maxGraphemes 300
			 */
			"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 3000),
					/*#__PURE__*/ v.stringGraphemes(0, 300)
				]
			)),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.presentationDelivery": mainSchema;
	}
}
