import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as IdSifaDefs from "../defs.js";

const _authorSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.profile.publication#author")),
		/**
		 * Author's ATproto DID, if they have an account.
		 */
		"did": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Author's display name.
		 * @minLength 1
		 * @maxLength 1000
		 * @maxGraphemes 100
		 */
		"name": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(1, 1000),
				/*#__PURE__*/ v.stringGraphemes(0, 100)
			]
		),
	}
);
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("id.sifa.profile.publication"),
			/**
			 * Co-authors. The record owner is always an implicit author.
			 * @maxLength 50
			 */
			get "authors"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(authorSchema),
					[/*#__PURE__*/ v.arrayLength(0, 50)]
				))
			},
			/**
			 * Client-declared timestamp when this record was originally created.
			 */
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Description or abstract.
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
			 * Digital Object Identifier, bare rather than as a URL: "10.1234/example", not "https://doi.org/10.1234/example". A DOI identifies the work itself, so it is what two records describing one publication can be matched on. Carrying it inside `url` makes it a link and stops it being an identifier.
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"doi": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * Whether this is the user's primary publication, surfaced in profile Highlights. Any entry may be primary.
			 */
			"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Publication date in YYYY, YYYY-MM or YYYY-MM-DD format.
			 */
			"publishedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Publisher, journal, or venue name.
			 * @maxLength 2560
			 * @maxGraphemes 256
			 */
			"publisher": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2560),
					/*#__PURE__*/ v.stringGraphemes(0, 256)
				]
			)),
			/**
			 * Other versions or forms of this work, such as the published version of a preprint. A consumer can show linked versions as one publication.
			 * @maxLength 20
			 */
			get "relatedIdentifiers"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(IdSifaDefs.relatedIdentifierSchema),
					[/*#__PURE__*/ v.arrayLength(0, 20)]
				))
			},
			/**
			 * The same publication as recorded on another person's profile. Set when you keep your own entry for work someone else has also recorded, so consumers can tell the two describe one thing rather than showing it twice. Each side stays its own record: the other person cannot edit yours, and yours does not change theirs. Resolve by AT-URI, since they will keep editing their copy.
			 */
			get "sameAs"() {
				return /*#__PURE__*/ v.optional(IdSifaDefs.externalRecordRefSchema)
			},
			/**
			 * Publication subtitle. Carries the distinguishing part of a title that sources such as Crossref and ORCID store separately from the main title -- for example the volume/part designation and descriptive clause of a multi-part paper series ("III. Using cluster masses to create a cleaned catalogue"). Absent for publications with no subtitle.
			 * @maxLength 2000
			 * @maxGraphemes 200
			 */
			"subtitle": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(0, 2000),
					/*#__PURE__*/ v.stringGraphemes(0, 200)
				]
			)),
			/**
			 * Publication title.
			 * @minLength 1
			 * @maxLength 2000
			 * @maxGraphemes 200
			 */
			"title": /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string(),
				[
					/*#__PURE__*/ v.stringLength(1, 2000),
					/*#__PURE__*/ v.stringGraphemes(0, 200)
				]
			),
			/**
			 * Resource type. Open set: the known values are ORCID's work-type vocabulary, which is what Sifa already ingests and stores unmapped, so a synced work round-trips without a translation table. A value outside the set is kept as written rather than rejected, because a publication that reached Sifa from somewhere other than ORCID need not fit ORCID's list.
			 * @maxLength 640
			 * @maxGraphemes 64
			 */
			"type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"annotation" | "artistic-performance" | "book" | "book-chapter" | "book-review" | "conference-abstract" | "conference-paper" | "conference-poster" | "dataset" | "design" | "dictionary-entry" | "disclosure" | "dissertation" | "edited-book" | "encyclopedia-entry" | "journal-article" | "lecture-speech" | "license" | "newspaper-article" | "online-resource" | "other" | "patent" | "preprint" | "registered-copyright" | "report" | "research-technique" | "review" | "software" | "spin-off-company" | "standards-and-policy" | "supervised-student-publication" | "technical-standard" | "test" | "trademark" | "translation" | "working-paper" | (string & {})>(),
				[
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64)
				]
			)),
			/**
			 * URL to the publication.
			 */
			"url": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		}
	)
);
type author$schematype = typeof _authorSchema;
type main$schematype = typeof _mainSchema;

export interface authorSchema extends author$schematype {}

export interface mainSchema extends main$schematype {}
export const authorSchema = _authorSchema as authorSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Author extends v.InferInput<typeof authorSchema> {}

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"id.sifa.profile.publication": mainSchema;
	}
}
