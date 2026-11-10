import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.externalAccount"),
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Optional RSS or Atom feed URL. Auto-discovered or manually provided. Used for content rendering in the ATmosphere Stream.
			 */
			"feedUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
			/**
			 * Whether this is the user's primary external link, displayed prominently on the profile card.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Optional display name for this account (e.g., 'My Blog', 'Photography').
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * The platform or type of external account.
			 */
			"platform": /*#__PURE__*/ v.string<"id.sifa.defs#platformCodeberg" | "id.sifa.defs#platformFediverse" | "id.sifa.defs#platformForgejo" | "id.sifa.defs#platformGitea" | "id.sifa.defs#platformGithub" | "id.sifa.defs#platformGitlab" | "id.sifa.defs#platformInstagram" | "id.sifa.defs#platformLinkedin" | "id.sifa.defs#platformOrcid" | "id.sifa.defs#platformOther" | "id.sifa.defs#platformRss" | "id.sifa.defs#platformTwitter" | "id.sifa.defs#platformWebsite" | "id.sifa.defs#platformYoutube" | (string & {})>(),
			/**
			 * The profile or site URL. Displayed as a clickable link on the user's profile.
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
		"id.sifa.profile.externalAccount": mainSchema;
	}
}
