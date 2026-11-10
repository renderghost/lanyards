import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as CommunityLexiconLocationAddress from "../../../community/lexicon/location/address.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.location"),
			/**
			 * Structured location address. Sifa enforces ISO 3166-1 alpha-2 country codes at the app layer.
			 */
			get "address"() {
				return CommunityLexiconLocationAddress.mainSchema
			},
			/**
			 * Client-declared timestamp when this record was created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Whether this is the primary/display location.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Optional user-defined label for this location.
			 * @maxLength 600
			 * @maxGraphemes 60
			 */
			"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 600),
					/*#__PURE__*/ v.stringGraphemes(0, 60)
				]
			)),
			/**
			 * The role of this location.
			 */
			"type": /*#__PURE__*/ v.string<"id.sifa.defs#locationBusiness" | "id.sifa.defs#locationPrimary" | "id.sifa.defs#locationTravel" | (string & {})>(),
		}
	)
);
type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}
export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.location": mainSchema;
	}
}
