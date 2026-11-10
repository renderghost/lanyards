import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from "@atcute/atproto/types/label/defs";
import * as CommunityLexiconLocationAddress from "../../../community/lexicon/location/address.js";
import * as IdSifaDefs from "../defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.education"),
			/**
			 * Activities, societies, and extracurriculars.
			 * @maxLength 10000
			 * @maxGraphemes 1000
			 */
			"activities": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 10000),
					/*#__PURE__*/ v.stringGraphemes(0, 1000)
				]
			)),
			/**
			 * The educational institution, as a single nested reference mirroring the flat institution / institutionDid / entityRef fields. Additive dual-write: the flat fields remain the source of truth for existing consumers.
			 */
			get "agentRef"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
			},
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Degree name (e.g., 'Bachelor of Science', 'Master of Arts').
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"degree": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * Additional description or notes about the education.
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
			 * End date (graduation or expected graduation) in YYYY, YYYY-MM or YYYY-MM-DD format. Omit if currently enrolled.
			 */
			"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Portable, app-neutral identifier for the educational institution the user selected from a resolver dropdown: a Wikidata Q-ID URI (http://www.wikidata.org/entity/Q...), a ROR URI, or an LEI URI. Enables deterministic resolution to a canonical entity even before the institution claims an ATproto account. Absent for free-text entries.
			 */
			"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
			/**
			 * Level of the qualification on the European Qualifications Framework (EQF), 1 to 8. 6 is bachelor level, 7 is master level, 8 is doctoral level. Omit when unknown. The free-text degree stays the display name.
			 * @minimum 1
			 * @maximum 8
			 */
			"eqfLevel": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.integer(),
				[/*#__PURE__*/ v.integerRange(1, 8)]
			)),
			/**
			 * Field of study or major.
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"fieldOfStudy": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * Grade, GPA, or classification achieved.
			 * @maxLength 500
			 * @maxGraphemes 50
			 */
			"grade": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 500),
					/*#__PURE__*/ v.stringGraphemes(0, 50)
				]
			)),
			/**
			 * Name of the educational institution.
			 * @minLength 1
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"institution": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			),
			/**
			 * DID of the institution's ATproto account, if one exists.
			 */
			"institutionDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Whether this is the user's primary education entry, surfaced in profile Highlights. Any entry may be primary.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Self-label values for this education record.
			 */
			get "labels"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]))
			},
			/**
			 * Institution location. Sifa enforces ISO 3166-1 alpha-2 country codes at the app layer.
			 */
			get "location"() {
				return /*#__PURE__*/ v.optional(CommunityLexiconLocationAddress.mainSchema)
			},
			/**
			 * Skills gained or used in this education. Each entry is a URI reference to an id.sifa.profile.skill record owned by the same DID.
			 * @maxLength 50
			 */
			get "skills"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.skillRefSchema),
					[/*#__PURE__*/ v.arrayLength(0, 50)]
				))
			},
			/**
			 * Start date in YYYY, YYYY-MM or YYYY-MM-DD format.
			 */
			"startedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Tools used in this education. Each entry is a URI reference to a tool item record owned by the same DID. Consumers ignore entries that do not resolve.
			 * @maxLength 50
			 */
			get "tools"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.toolRefSchema),
					[/*#__PURE__*/ v.arrayLength(0, 50)]
				))
			},
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.education": mainSchema;
	}
}
