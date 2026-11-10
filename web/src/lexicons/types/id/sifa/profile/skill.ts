import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as IdSifaDefs from "../defs.js";

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.skill"),
			/**
			 * Broad skill category for grouping.
			 */
			"category": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#business" | "id.sifa.defs#community" | "id.sifa.defs#creative" | "id.sifa.defs#industry" | "id.sifa.defs#interpersonal" | "id.sifa.defs#security" | "id.sifa.defs#technical" | (string & {})>()),
			/**
			 * Where the owner uses this skill: for work, in private life or as a hobby, or both. Set by the owner, never inferred from the skill or its tools. Absent or empty means unspecified. Consumers treat a repeated value as one. A display hint only: it does not make the skill or anything else private, and all records are public.
			 * @maxLength 2
			 */
			"contexts": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<"id.sifa.defs#contextPersonal" | "id.sifa.defs#contextProfessional" | (string & {})>()),
				[/*#__PURE__*/ v.arrayLength(0, 2)]
			)),
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Skill name (e.g., 'JavaScript', 'Project Management').
			 * @minLength 1
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"name": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			),
			/**
			 * Optional user-defined grouping label nested under category (e.g., 'Frontend', 'Backend', 'Databases'). Freeform: unlike category there are no known values, so renderers can present skills in the user's own groups. Renderers decide the display label.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"subCategory": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * Tools the owner uses for this skill, for expertise tied to a specific tool. Each entry is a URI reference to a tool item record owned by the same DID. Consumers ignore entries that do not resolve.
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
		"id.sifa.profile.skill": mainSchema;
	}
}
