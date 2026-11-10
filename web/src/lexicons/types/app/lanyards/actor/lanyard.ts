import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _blockSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("app.lanyards.actor.lanyard#block")),
		/**
		 * How many items to show; 3 by default, all links (up to 20) for the links block
		 * @minimum 1
		 * @maximum 20
		 */
		"limit": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.integer(),
			[/*#__PURE__*/ v.integerRange(1, 20)]
		)),
		/**
		 * @maxLength 32
		 */
		"type": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string<"blogPosts" | "bskyPosts" | "code" | "collections" | "details" | "education" | "events" | "links" | "media" | "openTo" | "publications" | "skills" | "talks" | (string & {})>(),
			[/*#__PURE__*/ v.stringLength(0, 32)]
		),
		"visible": /*#__PURE__*/ v.boolean(),
	}
);
const _connectPrefsSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("app.lanyards.actor.lanyard#connectPrefs")),
		/**
		 * @default true
		 */
		"follow": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		/**
		 * @default true
		 */
		"metPack": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		/**
		 * @default true
		 */
		"vouch": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	}
);
const _eventOverrideSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("app.lanyards.actor.lanyard#eventOverride")),
		/**
		 * Block types moved to the top for this event
		 * @maxLength 13
		 */
		"emphasise": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"blogPosts" | "bskyPosts" | "code" | "collections" | "details" | "education" | "events" | "links" | "media" | "openTo" | "publications" | "skills" | "talks" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 32)]
			)),
			[/*#__PURE__*/ v.arrayLength(0, 13)]
		)),
		/**
		 * The community.lexicon.calendar.event this override applies to
		 */
		"event": /*#__PURE__*/ v.resourceUriString(),
		/**
		 * @maxLength 1000
		 * @maxGraphemes 100
		 */
		"headline": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 1000),
				/*#__PURE__*/ v.stringGraphemes(0, 100)
			]
		)),
		/**
		 * @maxLength 2000
		 * @maxGraphemes 200
		 */
		"hereFor": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 2000),
				/*#__PURE__*/ v.stringGraphemes(0, 200)
			]
		)),
		/**
		 * Starter packs of people met at this event, in rollover order
		 * @maxLength 20
		 */
		"metPacks": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
			[/*#__PURE__*/ v.arrayLength(0, 20)]
		)),
	}
);
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal("self"),
	/*#__PURE__*/ v.object(
		{
			"$type": /*#__PURE__*/ v.literal("app.lanyards.actor.lanyard"),
			/**
			 * Accent palette; violet when absent or unknown
			 * @maxLength 32
			 */
			"accent": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<"ember" | "indigo" | "moss" | "ocean" | "plum" | "rose" | "teal" | "violet" | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 32)]
			)),
			/**
			 * Blocks in display order
			 * @maxLength 20
			 */
			get "blocks"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(blockSchema),
					[/*#__PURE__*/ v.arrayLength(0, 20)]
				))
			},
			get "connect"() {
				return /*#__PURE__*/ v.optional(connectPrefsSchema)
			},
			"createdAt": /*#__PURE__*/ v.datetimeString(),
			/**
			 * Per-event lanyard overrides, matched by event URI
			 * @maxLength 200
			 */
			get "events"() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(eventOverrideSchema),
					[/*#__PURE__*/ v.arrayLength(0, 200)]
				))
			},
			/**
			 * AT-URIs or URLs of individual items hidden from the lanyard
			 * @maxLength 500
			 */
			"hidden": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.string(),
					[/*#__PURE__*/ v.stringLength(0, 2048)]
				)),
				[/*#__PURE__*/ v.arrayLength(0, 500)]
			)),
			/**
			 * Show the current job line on the badge
			 * @default true
			 */
			"showJob": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
			"updatedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}
	)
);
type block$schematype = typeof _blockSchema;
type connectPrefs$schematype = typeof _connectPrefsSchema;
type eventOverride$schematype = typeof _eventOverrideSchema;
type main$schematype = typeof _mainSchema;

export interface blockSchema extends block$schematype {}

export interface connectPrefsSchema extends connectPrefs$schematype {}

export interface eventOverrideSchema extends eventOverride$schematype {}

export interface mainSchema extends main$schematype {}
export const blockSchema = _blockSchema as blockSchema;
export const connectPrefsSchema = _connectPrefsSchema as connectPrefsSchema;
export const eventOverrideSchema = _eventOverrideSchema as eventOverrideSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Block extends v.InferInput<typeof blockSchema> {}

export interface ConnectPrefs extends v.InferInput<typeof connectPrefsSchema> {}

export interface EventOverride extends v.InferInput<typeof eventOverrideSchema> {}

export interface Main extends v.InferInput<typeof mainSchema> {}
declare module '@atcute/lexicons/ambient' {
	interface Records {
		"app.lanyards.actor.lanyard": mainSchema;
	}
}
