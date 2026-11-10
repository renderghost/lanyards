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
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.position"),
			/**
			 * The employer, as a single nested reference mirroring the flat company / companyDid / entityRef fields. Additive dual-write: the flat fields remain the source of truth for existing consumers.
			 */
			get "agentRef"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
			},
			/**
			 * Organization name. Optional: omit for self-employed, freelance, contract, or independent work that has no separately named or registered entity.
			 * @minLength 1
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"company": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * DID of the organization's ATproto account, if one exists. Enables verified organization linking.
			 */
			"companyDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Description of responsibilities, achievements, and duties.
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
			 * Type of employment (full-time, part-time, contract, etc.).
			 */
			"employmentType": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#advisor" | "id.sifa.defs#apprenticeship" | "id.sifa.defs#boardMember" | "id.sifa.defs#boardObserver" | "id.sifa.defs#contract" | "id.sifa.defs#fellowship" | "id.sifa.defs#freelance" | "id.sifa.defs#fullTime" | "id.sifa.defs#independentWork" | "id.sifa.defs#internship" | "id.sifa.defs#partTime" | "id.sifa.defs#seasonal" | "id.sifa.defs#selfEmployed" | "id.sifa.defs#temporary" | "id.sifa.defs#trainee" | "id.sifa.defs#volunteer" | (string & {})>()),
			/**
			 * End date of the position in YYYY, YYYY-MM or YYYY-MM-DD format. Omit if this is a current position.
			 */
			"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Portable, app-neutral identifier for the organization the user selected from a resolver dropdown: a Wikidata Q-ID URI (http://www.wikidata.org/entity/Q...), a ROR URI, or an LEI URI. Enables deterministic resolution to a canonical entity even before the org claims an ATproto account. Absent for free-text or independent/self-employed positions.
			 */
			"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
			/**
			 * Whether this is the user's primary current position, displayed on the identity card.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Self-label values for this position record.
			 */
			get "labels"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]))
			},
			/**
			 * Work location. Sifa enforces ISO 3166-1 alpha-2 country codes at the app layer.
			 */
			get "location"() {
				return /*#__PURE__*/ v.optional(CommunityLexiconLocationAddress.mainSchema)
			},
			/**
			 * Name of the party this role is held on behalf of, when the person represents someone else — most often a fund whose board seat this is. A disclosure, not a role type. Omit for independent seats.
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"onBehalfOf": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * DID of the represented party's ATproto account, if one exists. May resolve to an organization or to a person (e.g. a family-office principal).
			 */
			"onBehalfOfDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Portable, app-neutral identifier for the represented party selected from a resolver dropdown: a Wikidata Q-ID URI, a ROR URI, or an LEI URI. Absent for free-text entries.
			 */
			"onBehalfOfEntityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
			/**
			 * Skills used in this position. Each entry is a URI reference to an id.sifa.profile.skill record owned by the same DID.
			 * @maxLength 50
			 */
			get "skills"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.skillRefSchema),
					[/*#__PURE__*/ v.arrayLength(0, 50)]
				))
			},
			/**
			 * Start date of the position in YYYY, YYYY-MM or YYYY-MM-DD format.
			 */
			"startedAt": /*#__PURE__*/ v.string(),
			/**
			 * Job title or role name.
			 * @minLength 1
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"title": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			),
			/**
			 * Workplace arrangement (on-site, remote, hybrid).
			 */
			"workplaceType": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#hybrid" | "id.sifa.defs#onSite" | "id.sifa.defs#remote" | (string & {})>()),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.position": mainSchema;
	}
}
