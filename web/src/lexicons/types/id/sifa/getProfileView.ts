import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as IdSifaDefs from "./defs.js";

const _activeAppViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#activeAppView")),
		/**
		 * App category.
		 */
		"category": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * App identifier.
		 */
		"id": /*#__PURE__*/ v.string(),
		/**
		 * Timestamp of the latest record.
		 */
		"latestRecordAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * App display name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * Recent record count.
		 */
		"recentCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}
);
const _atfundLinkSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#atfundLink")),
		/**
		 * Optional display label.
		 */
		"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Contribution URL.
		 */
		"url": /*#__PURE__*/ v.genericUriString(),
	}
);
const _certificationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#certificationView")),
		/**
		 * Canonical issuing-authority reference (name plus optional did/entityRef). Mirrors the flat authority/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * URL of the credential.
		 */
		"credentialUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved issuer entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Expiry date. Partial date.
		 */
		"expiryDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Issue date. Partial date.
		 */
		"issueDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Issuing organization.
		 */
		"issuingOrg": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Certification name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * Record key of the certification record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
	}
);
const _coSpeakerViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#coSpeakerView")),
		/**
		 * Avatar URL, when linked.
		 */
		"avatar": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether the co-speaker holds a claimed Sifa account. Identity is shown before confirmation when claimed.
		 */
		"claimed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether the co-speaker has confirmed the claim with an id.sifa.confirmation.
		 */
		"confirmed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether the delivery changed materially after the co-speaker confirmed it.
		 */
		"confirmedStale": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * DID of the co-speaker, when linked to a Sifa profile.
		 */
		"did": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Display name, when linked.
		 */
		"displayName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Handle, when linked.
		 */
		"handle": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
		/**
		 * Whether Sifa has indexed this account (it may be an unclaimed atproto account).
		 */
		"hasSifaProfile": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Free-text co-speaker name, when not linked.
		 */
		"name": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _contributorViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#contributorView")),
		/**
		 * Sifa/AT Protocol DID, when linked.
		 */
		"did": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Handle, when linked.
		 */
		"handle": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
		/**
		 * Contributor name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * ORCID identifier.
		 */
		"orcidId": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _courseViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#courseView")),
		/**
		 * Canonical institution reference (name plus optional did/entityRef). Mirrors the flat institution/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Completion date of a taken course (YYYY, YYYY-MM or YYYY-MM-DD).
		 */
		"completedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of a linked certification, when present.
		 */
		"credentialRkey": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the linked education record the course was part of, when present.
		 */
		"educationRkey": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * When the user last taught the course; absent if ongoing.
		 */
		"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved institution entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Institution name.
		 */
		"institution": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Course name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * Course number or code.
		 */
		"number": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the linked position the course was part of, when present.
		 */
		"positionRkey": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the course record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * The user's role in the course (id.sifa.defs#courseRole). Absent means taken.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * When the user started teaching the course (YYYY, YYYY-MM or YYYY-MM-DD).
		 */
		"startedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _durationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#durationView")),
		/**
		 * Maximum duration in minutes.
		 */
		"maxMinutes": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Minimum duration in minutes.
		 */
		"minMinutes": /*#__PURE__*/ v.integer(),
	}
);
const _educationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#educationView")),
		/**
		 * Activities and societies.
		 */
		"activities": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Canonical institution reference (name plus optional did/entityRef). Mirrors the flat institution/institutionDid/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Degree earned.
		 */
		"degree": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Additional description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * End date. Partial date.
		 */
		"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved institution entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * European Qualifications Framework level of the degree (1 to 8, 8 is doctoral), when set.
		 * @minimum 1
		 * @maximum 8
		 */
		"eqfLevel": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.integer(),
			[/*#__PURE__*/ v.integerRange(1, 8)]
		)),
		/**
		 * Field of study.
		 */
		"fieldOfStudy": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Institution name.
		 */
		"institution": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * DID of the institution, when known.
		 */
		"institutionDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Whether this is the user's primary education entry.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the education record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Start date. Partial date.
		 */
		"startedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _externalAccountViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#externalAccountView")),
		/**
		 * Feed URL (RSS/Atom), when applicable.
		 */
		"feedUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Optional custom label.
		 */
		"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Platform type.
		 */
		get "platform"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.externalPlatformSchema)
		},
		/**
		 * Whether this is the primary external account.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the external account record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Account URL.
		 */
		"url": /*#__PURE__*/ v.genericUriString(),
		/**
		 * Whether the account can be verified.
		 */
		"verifiable": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether the account is verified.
		 */
		"verified": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Verification method, when verified.
		 */
		"verifiedVia": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _honorViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#honorView")),
		/**
		 * Canonical issuer reference (name plus optional did/entityRef). Mirrors the flat issuer/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Date received. Partial date.
		 */
		"date": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved issuer entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Issuing organization.
		 */
		"issuer": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * What kind of honor this is. Absent means unspecified.
		 */
		"kind": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#honorAward" | "id.sifa.defs#honorChampionship" | "id.sifa.defs#honorNomination" | "id.sifa.defs#honorRecognition" | "id.sifa.defs#honorRecord" | (string & {})>()),
		/**
		 * Public sources for the honor.
		 */
		get "links"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.artifactLinkSchema))
		},
		/**
		 * Record key of the honor record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Honor or award title.
		 */
		"title": /*#__PURE__*/ v.string(),
	}
);
const _involvementLinkViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#involvementLinkView")),
		/**
		 * What the link points to (e.g. pull-request, talk, article).
		 */
		"kind": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Optional human-readable label.
		 */
		"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Artifact URL.
		 */
		"url": /*#__PURE__*/ v.genericUriString(),
		/**
		 * True if the link host matches a verified external account.
		 */
		"verified": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Platform token of the verified host, when verified.
		 */
		"verifiedPlatform": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _involvementViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#involvementView")),
		/**
		 * Canonical upstream reference (name plus optional did/entityRef). Mirrors the flat upstream/upstreamDid/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * End date. Partial date.
		 */
		"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * The nature of the involvement.
		 */
		get "kind"() {
			return IdSifaDefs.involvementKindSchema
		},
		/**
		 * True if mapped from a legacy volunteering record.
		 */
		"legacy": /*#__PURE__*/ v.boolean(),
		/**
		 * Public artifact links proving the work.
		 */
		get "links"() {
			return /*#__PURE__*/ v.array(involvementLinkViewSchema)
		},
		/**
		 * Whether this is the user's primary current involvement.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the involvement (or legacy volunteering) record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Role in the involvement.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Start date. Partial date.
		 */
		"startedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Name of the community, org, or person the involvement is with.
		 */
		"upstream": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * DID of the upstream, when known.
		 */
		"upstreamDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * URL of the upstream, when provided.
		 */
		"upstreamUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}
);
const _languageViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#languageView")),
		/**
		 * Language name or BCP-47 tag.
		 */
		"language": /*#__PURE__*/ v.string(),
		/**
		 * Proficiency level.
		 */
		get "proficiency"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.proficiencySchema)
		},
		/**
		 * Record key of the language record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
	}
);
const _locationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#locationView")),
		/**
		 * ISO 3166-1 alpha-2 country code.
		 */
		"countryCode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Whether this is the primary location.
		 */
		"isPrimary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Optional custom label.
		 */
		"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Assembled human-readable location string.
		 */
		"location": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Country name.
		 */
		"locationCountry": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * City or locality.
		 */
		"locationLocality": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Region, state, or province.
		 */
		"locationRegion": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the location record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * The role this location plays.
		 */
		get "type"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.locationTypeSchema)
		},
	}
);
const _mainSchema = /*#__PURE__*/ v.query(
	"id.sifa.getProfileView",
	{
		"params": /*#__PURE__*/ v.object(
			{
				/**
				 * The handle or DID of the profile to fetch.
				 */
				"actor": /*#__PURE__*/ v.actorIdentifierString(),
			}
		),
		"output": {
			"type": "lex",
			get "schema"() {
				return profileViewSchema
			},
		}
	}
);
const _pdsProviderViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#pdsProviderView")),
		/**
		 * PDS hostname.
		 */
		"host": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Human-readable provider name.
		 */
		"name": /*#__PURE__*/ v.string(),
	}
);
const _positionVerificationSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#positionVerification")),
		/**
		 * Present only while the verification rests on email alone.
		 */
		"expiresAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Every method that currently backs the verification.
		 */
		get "methods"() {
			return /*#__PURE__*/ v.array(IdSifaDefs.verificationMethodSchema)
		},
		get "status"() {
			return IdSifaDefs.employmentStatusSchema
		},
		/**
		 * AT-URI of the issued id.sifa.verification.employment record in Sifa's issuer repository.
		 */
		"uri": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		"verifiedAt": /*#__PURE__*/ v.datetimeString(),
	}
);
const _positionViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#positionView")),
		/**
		 * Canonical organization reference (name plus optional did/entityRef). Mirrors the flat company/companyDid/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Organization name.
		 */
		"company": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * DID of the organization, when known.
		 */
		"companyDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * ISO 3166-1 alpha-2 country code.
		 */
		"countryCode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Role description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Employment arrangement.
		 */
		get "employmentType"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.employmentTypeSchema)
		},
		/**
		 * End date. Partial date, absent if current.
		 */
		"endedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Resolved canonical organization name.
		 */
		"entityName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved organization entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Assembled human-readable location string.
		 */
		"location": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Country name.
		 */
		"locationCountry": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * City or locality.
		 */
		"locationLocality": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Region, state, or province.
		 */
		"locationRegion": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Party this role is held on behalf of, when the person represents someone else — most often a fund whose board seat this is. A disclosure, not a role type. Absent for independent roles.
		 */
		"onBehalfOf": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * DID of the represented party, when known. May be an organization or a person.
		 */
		"onBehalfOfDid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Resolved canonical name for the represented party. Present only when the reference resolves; clients render onBehalfOf otherwise, never the raw URI.
		 */
		"onBehalfOfEntityName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved entity for the represented party.
		 */
		"onBehalfOfEntityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether this is the user's primary current position.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the position record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Record keys of skills linked to this position.
		 */
		"skillRkeys": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Start date. Partial date (YYYY, YYYY-MM, or YYYY-MM-DD).
		 */
		"startedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Job title or role.
		 */
		"title": /*#__PURE__*/ v.string(),
		/**
		 * Sifa's verification of this position, when one is issued. Absent when the position is not verified; absence is not a negative signal.
		 */
		get "verification"() {
			return /*#__PURE__*/ v.optional(positionVerificationSchema)
		},
		/**
		 * Workplace arrangement.
		 */
		get "workplaceType"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.workplaceTypeSchema)
		},
	}
);
const _presentationDeliveryViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#presentationDeliveryView")),
		/**
		 * Co-speakers on this delivery.
		 */
		get "coSpeakers"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(coSpeakerViewSchema))
		},
		/**
		 * ISO 3166-1 alpha-2 country code of the delivery location.
		 */
		"countryCode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Delivery date. Partial date.
		 */
		"date": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Name of the event or occasion.
		 */
		"eventName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * AT-URI of a linked event record.
		 */
		"eventUri": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Related links for this delivery.
		 */
		get "links"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.presentationLinkSchema))
		},
		/**
		 * Event location.
		 */
		"location": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Resolved country name of the delivery location.
		 */
		"locationCountry": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * City or locality of the delivery location.
		 */
		"locationLocality": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Region or state of the delivery location.
		 */
		"locationRegion": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Delivery mode (e.g. in-person, remote, hybrid).
		 */
		"mode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the parent presentation, when grouped.
		 */
		"presentationRkey": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Record key of the delivery record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * The user's role in the delivery.
		 */
		get "role"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.presentationRoleSchema)
		},
		/**
		 * AT-URI of the same delivery on another person's profile, when they keep one.
		 */
		"sameAs": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Delivery status.
		 */
		"status": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Delivery title (may differ from the presentation title).
		 */
		"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _presentationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#presentationView")),
		/**
		 * Renderable URL of the presentation cover image, when set.
		 */
		"coverImageUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Deliveries of this presentation.
		 */
		get "deliveries"() {
			return /*#__PURE__*/ v.array(presentationDeliveryViewSchema)
		},
		/**
		 * Presentation description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Duration range in minutes.
		 */
		get "duration"() {
			return /*#__PURE__*/ v.optional(durationViewSchema)
		},
		/**
		 * Intended audiences.
		 */
		"intendedAudiences": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Related links (slides, recording, etc.).
		 */
		get "links"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.presentationLinkSchema))
		},
		/**
		 * Whether this is the user's primary talk.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the presentation record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Presentation title.
		 */
		"title": /*#__PURE__*/ v.string(),
		/**
		 * AT-URI of a linked write-up record.
		 */
		"writeupUri": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	}
);
const _profileViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#profileView")),
		/**
		 * Longer professional summary or bio.
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
		 * AT Protocol apps this account has recently created records in.
		 */
		get "activeApps"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(activeAppViewSchema))
		},
		/**
		 * Optional contribution/funding link.
		 */
		get "atfundContribute"() {
			return /*#__PURE__*/ v.optional(atfundLinkSchema)
		},
		/**
		 * Number of app.bsky.graph followers.
		 */
		"atprotoFollowersCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Start of an availability window, as a UTC offset, if set.
		 */
		"availableFromUtc": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * End of an availability window, as a UTC offset, if set.
		 */
		"availableToUtc": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * URL of the profile avatar image.
		 */
		"avatar": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether the account holds a Bluesky verification.
		 */
		"blueskyVerified": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * When the Bluesky verification was issued.
		 */
		"blueskyVerifiedAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Certifications and licenses.
		 */
		get "certifications"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(certificationViewSchema))
		},
		/**
		 * Whether the profile has been claimed by its owner on Sifa.
		 */
		"claimed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Number of confirmed professional connections.
		 */
		"connectionsCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * ISO 3166-1 alpha-2 country code for the primary location.
		 */
		"countryCode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Courses, optionally linked to a credential.
		 */
		get "courses"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(courseViewSchema))
		},
		/**
		 * When the profile record was created.
		 */
		"createdAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * The account DID. Stable identifier for the profile.
		 */
		"did": /*#__PURE__*/ v.didString(),
		/**
		 * Display name shown on the profile.
		 * @maxLength 1280
		 * @maxGraphemes 128
		 */
		"displayName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 1280),
				/*#__PURE__*/ v.stringGraphemes(0, 128)
			]
		)),
		/**
		 * Education history entries.
		 */
		get "education"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(educationViewSchema))
		},
		/**
		 * Linked external accounts, with verification state.
		 */
		get "externalAccounts"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(externalAccountViewSchema))
		},
		/**
		 * Family (last) name, when provided.
		 * @maxLength 1280
		 * @maxGraphemes 128
		 */
		"familyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 1280),
				/*#__PURE__*/ v.stringGraphemes(0, 128)
			]
		)),
		/**
		 * Number of Sifa graph followers.
		 */
		"followersCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Number of accounts this profile follows on the Sifa graph.
		 */
		"followingCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Given (first) name, when provided.
		 * @maxLength 1280
		 * @maxGraphemes 128
		 */
		"givenName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 1280),
				/*#__PURE__*/ v.stringGraphemes(0, 128)
			]
		)),
		/**
		 * The current handle for the account.
		 */
		"handle": /*#__PURE__*/ v.handleString(),
		/**
		 * Short professional headline.
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		"headline": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300)
			]
		)),
		/**
		 * Honors and awards.
		 */
		get "honors"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(honorViewSchema))
		},
		/**
		 * Industry/domain pairs the user works in.
		 */
		get "industries"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.industryDomainSchema))
		},
		/**
		 * Community, open-source, charity, and civic involvement.
		 */
		get "involvement"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(involvementViewSchema))
		},
		/**
		 * BCP-47 language tags the user has indicated.
		 */
		"langs": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Spoken/written languages with proficiency.
		 */
		get "languages"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(languageViewSchema))
		},
		/**
		 * Assembled human-readable primary location string.
		 */
		"location": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Primary location country name.
		 */
		"locationCountry": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Primary location city or locality.
		 */
		"locationLocality": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Primary location region, state, or province.
		 */
		"locationRegion": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * All professional locations on the profile.
		 */
		get "locations"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(locationViewSchema))
		},
		/**
		 * Number of confirmed in-person meetings.
		 */
		"metInPersonCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Free-form phonetic respelling of the name, when provided.
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
		 * URL of the name-pronunciation audio clip, served from the PDS. Present when a clip is set.
		 */
		"namePronunciationAudioUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * The kinds of opportunities the user is open to.
		 */
		get "openTo"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.openToWorkStatusSchema))
		},
		/**
		 * The account PDS provider.
		 */
		get "pdsProvider"() {
			return /*#__PURE__*/ v.optional(pdsProviderViewSchema)
		},
		/**
		 * Work history entries.
		 */
		get "positions"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(positionViewSchema))
		},
		/**
		 * Preferred workplace arrangements.
		 */
		get "preferredWorkplace"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.workplaceTypeSchema))
		},
		/**
		 * Standalone deliveries that reference no owned presentation.
		 */
		get "presentationDeliveries"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(presentationDeliveryViewSchema))
		},
		/**
		 * Talks and sessions (content), each with its deliveries grouped underneath.
		 */
		get "presentations"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(presentationViewSchema))
		},
		/**
		 * Personal or professional projects.
		 */
		get "projects"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(projectViewSchema))
		},
		/**
		 * Self-described pronouns.
		 * @maxLength 640
		 * @maxGraphemes 64
		 */
		"pronouns": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 640),
				/*#__PURE__*/ v.stringGraphemes(0, 64)
			]
		)),
		/**
		 * Publications, merged from Sifa records and linked ORCID works.
		 */
		get "publications"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(publicationViewSchema))
		},
		/**
		 * Skills, optionally linked to positions.
		 */
		get "skills"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(skillViewSchema))
		},
		/**
		 * Legacy volunteering entries. New entries are surfaced under involvement.
		 */
		get "volunteering"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(volunteeringViewSchema))
		},
		/**
		 * Primary personal or professional website.
		 */
		"website": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}
);
const _projectEventViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#projectEventView")),
		/**
		 * ISO 3166-1 alpha-2 country code, from the event's first address.
		 */
		"country": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * City, from the event's first address.
		 */
		"locality": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Event mode token, from the event record.
		 */
		"mode": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Event name, from the event record.
		 */
		"name": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * The user's role at this occurrence, if it differs from the project's role.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Event start, from the event record.
		 */
		"startsAt": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * AT-URI of the linked community.lexicon.calendar.event.
		 */
		"uri": /*#__PURE__*/ v.resourceUriString(),
		/**
		 * Event website, from the event's first uri.
		 */
		"url": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}
);
const _projectMemberViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#projectMemberView")),
		/**
		 * Avatar URL, when identity may be shown.
		 */
		"avatar": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether the member holds a claimed Sifa account. Identity is shown before confirmation when claimed.
		 */
		"claimed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether the member has confirmed the claim with an id.sifa.confirmation.
		 */
		"confirmed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether the project changed materially after the member confirmed it.
		 */
		"confirmedStale": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * DID of the member.
		 */
		"did": /*#__PURE__*/ v.didString(),
		/**
		 * Display name, when identity may be shown.
		 */
		"displayName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Handle of the member (falls back to the DID when it does not resolve).
		 */
		"handle": /*#__PURE__*/ v.string(),
		/**
		 * Whether Sifa has indexed this account (it may be an unclaimed atproto account).
		 */
		"hasSifaProfile": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * The member's role, as labelled by the project owner.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * The member's title, as labelled by the project owner.
		 */
		"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _projectViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#projectView")),
		/**
		 * Project description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * End date. Partial date.
		 */
		"endDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Events this project organized or hosted (from the record's events field), with display fields resolved from the referenced event records.
		 * @maxLength 200
		 */
		get "events"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(projectEventViewSchema),
				[/*#__PURE__*/ v.arrayLength(0, 200)]
			))
		},
		/**
		 * People named as members of this project.
		 */
		get "members"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(projectMemberViewSchema))
		},
		/**
		 * Project name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * Whether this is the user's primary ongoing project.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Record key of the project record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * The user's own role on the project.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * AT-URI of the same project on another person's profile, when they keep one.
		 */
		"sameAs": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Start date. Partial date.
		 */
		"startDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Project URL.
		 */
		"url": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}
);
const _publicationViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#publicationView")),
		/**
		 * Linked contributors (co-authors).
		 */
		get "contributors"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(contributorViewSchema))
		},
		/**
		 * Publication date. Partial date.
		 */
		"date": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Description or abstract.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Digital Object Identifier.
		 */
		"doi": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Cover or preview image URL.
		 */
		"image": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether an ORCID work corroborates a Sifa record.
		 */
		"orcidCorroborated": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Whether this is the user's primary publication.
		 */
		"primary": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Name of the source publication venue, when present.
		 */
		"publicationName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * AT-URI of the source publication record, when present.
		 */
		"publicationUri": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Canonical publication URL, when present.
		 */
		"publicationUrl": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Publisher or journal.
		 */
		"publisher": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Other versions or forms of this work: the relations declared on the record plus, for a DOI, those registered with DataCite or Crossref. Clients can fold a preprint under its published version.
		 */
		get "relatedIdentifiers"() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(IdSifaDefs.relatedIdentifierSchema))
		},
		/**
		 * Record key, or a synthetic key for ORCID-only works.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Subtitle.
		 */
		"subtitle": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Publication title.
		 */
		"title": /*#__PURE__*/ v.string(),
		/**
		 * Publication type token.
		 */
		"type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Human-readable publication type.
		 */
		"typeLabel": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Publication URL.
		 */
		"url": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Whether the publication is verified (e.g. via ORCID).
		 */
		"verified": /*#__PURE__*/ v.boolean(),
		/**
		 * Verification source, when verified.
		 */
		"verifiedVia": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _skillViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#skillView")),
		/**
		 * Broad category.
		 */
		get "category"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.skillCategorySchema)
		},
		/**
		 * CID of the skill record, for referencing it in endorsements.
		 */
		"cid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		/**
		 * Whether this skill has any confirmed endorsements.
		 */
		"endorsed": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Prior names this skill was endorsed under before it was renamed.
		 */
		"endorsedAs": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Number of confirmed endorsements of this skill.
		 * @minimum 0
		 */
		"endorsementCount": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Skill name.
		 */
		"name": /*#__PURE__*/ v.string(),
		/**
		 * Record keys of positions this skill is linked to.
		 */
		"positionRkeys": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Record key of the skill record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Freeform user-defined grouping label nested under category.
		 */
		"subCategory": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
const _volunteeringViewSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.getProfileView#volunteeringView")),
		/**
		 * Canonical organization reference (name plus optional did/entityRef). Mirrors the flat organization/entityRef fields during the migration; the two always agree.
		 */
		get "agentRef"() {
			return /*#__PURE__*/ v.optional(IdSifaDefs.agentRefSchema)
		},
		/**
		 * Cause supported.
		 */
		"cause": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Current canonical name of the linked entity, when it resolves. The web shows it as a "Now {name}" hint when it differs from the saved snapshot name (#516).
		 */
		"currentCompanyName": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Description.
		 */
		"description": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * End date. Partial date.
		 */
		"endDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Pointer URI to the resolved organization entity.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Organization name.
		 */
		"organization": /*#__PURE__*/ v.string(),
		/**
		 * Record key of the volunteering record.
		 */
		"rkey": /*#__PURE__*/ v.string(),
		/**
		 * Role held.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Start date. Partial date.
		 */
		"startDate": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}
);
type activeAppView$schematype = typeof _activeAppViewSchema;
type atfundLink$schematype = typeof _atfundLinkSchema;
type certificationView$schematype = typeof _certificationViewSchema;
type coSpeakerView$schematype = typeof _coSpeakerViewSchema;
type contributorView$schematype = typeof _contributorViewSchema;
type courseView$schematype = typeof _courseViewSchema;
type durationView$schematype = typeof _durationViewSchema;
type educationView$schematype = typeof _educationViewSchema;
type externalAccountView$schematype = typeof _externalAccountViewSchema;
type honorView$schematype = typeof _honorViewSchema;
type involvementLinkView$schematype = typeof _involvementLinkViewSchema;
type involvementView$schematype = typeof _involvementViewSchema;
type languageView$schematype = typeof _languageViewSchema;
type locationView$schematype = typeof _locationViewSchema;
type main$schematype = typeof _mainSchema;
type pdsProviderView$schematype = typeof _pdsProviderViewSchema;
type positionVerification$schematype = typeof _positionVerificationSchema;
type positionView$schematype = typeof _positionViewSchema;
type presentationDeliveryView$schematype = typeof _presentationDeliveryViewSchema;
type presentationView$schematype = typeof _presentationViewSchema;
type profileView$schematype = typeof _profileViewSchema;
type projectEventView$schematype = typeof _projectEventViewSchema;
type projectMemberView$schematype = typeof _projectMemberViewSchema;
type projectView$schematype = typeof _projectViewSchema;
type publicationView$schematype = typeof _publicationViewSchema;
type skillView$schematype = typeof _skillViewSchema;
type volunteeringView$schematype = typeof _volunteeringViewSchema;

export interface activeAppViewSchema extends activeAppView$schematype {}

export interface atfundLinkSchema extends atfundLink$schematype {}

export interface certificationViewSchema extends certificationView$schematype {}

export interface coSpeakerViewSchema extends coSpeakerView$schematype {}

export interface contributorViewSchema extends contributorView$schematype {}

export interface courseViewSchema extends courseView$schematype {}

export interface durationViewSchema extends durationView$schematype {}

export interface educationViewSchema extends educationView$schematype {}

export interface externalAccountViewSchema extends externalAccountView$schematype {}

export interface honorViewSchema extends honorView$schematype {}

export interface involvementLinkViewSchema extends involvementLinkView$schematype {}

export interface involvementViewSchema extends involvementView$schematype {}

export interface languageViewSchema extends languageView$schematype {}

export interface locationViewSchema extends locationView$schematype {}

export interface mainSchema extends main$schematype {}

export interface pdsProviderViewSchema extends pdsProviderView$schematype {}

export interface positionVerificationSchema extends positionVerification$schematype {}

export interface positionViewSchema extends positionView$schematype {}

export interface presentationDeliveryViewSchema extends presentationDeliveryView$schematype {}

export interface presentationViewSchema extends presentationView$schematype {}

export interface profileViewSchema extends profileView$schematype {}

export interface projectEventViewSchema extends projectEventView$schematype {}

export interface projectMemberViewSchema extends projectMemberView$schematype {}

export interface projectViewSchema extends projectView$schematype {}

export interface publicationViewSchema extends publicationView$schematype {}

export interface skillViewSchema extends skillView$schematype {}

export interface volunteeringViewSchema extends volunteeringView$schematype {}
export const activeAppViewSchema = _activeAppViewSchema as activeAppViewSchema;
export const atfundLinkSchema = _atfundLinkSchema as atfundLinkSchema;
export const certificationViewSchema = _certificationViewSchema as certificationViewSchema;
export const coSpeakerViewSchema = _coSpeakerViewSchema as coSpeakerViewSchema;
export const contributorViewSchema = _contributorViewSchema as contributorViewSchema;
export const courseViewSchema = _courseViewSchema as courseViewSchema;
export const durationViewSchema = _durationViewSchema as durationViewSchema;
export const educationViewSchema = _educationViewSchema as educationViewSchema;
export const externalAccountViewSchema = _externalAccountViewSchema as externalAccountViewSchema;
export const honorViewSchema = _honorViewSchema as honorViewSchema;
export const involvementLinkViewSchema = _involvementLinkViewSchema as involvementLinkViewSchema;
export const involvementViewSchema = _involvementViewSchema as involvementViewSchema;
export const languageViewSchema = _languageViewSchema as languageViewSchema;
export const locationViewSchema = _locationViewSchema as locationViewSchema;
export const mainSchema = _mainSchema as mainSchema;
export const pdsProviderViewSchema = _pdsProviderViewSchema as pdsProviderViewSchema;
export const positionVerificationSchema = _positionVerificationSchema as positionVerificationSchema;
export const positionViewSchema = _positionViewSchema as positionViewSchema;
export const presentationDeliveryViewSchema = _presentationDeliveryViewSchema as presentationDeliveryViewSchema;
export const presentationViewSchema = _presentationViewSchema as presentationViewSchema;
export const profileViewSchema = _profileViewSchema as profileViewSchema;
export const projectEventViewSchema = _projectEventViewSchema as projectEventViewSchema;
export const projectMemberViewSchema = _projectMemberViewSchema as projectMemberViewSchema;
export const projectViewSchema = _projectViewSchema as projectViewSchema;
export const publicationViewSchema = _publicationViewSchema as publicationViewSchema;
export const skillViewSchema = _skillViewSchema as skillViewSchema;
export const volunteeringViewSchema = _volunteeringViewSchema as volunteeringViewSchema;

export interface ActiveAppView extends v.InferInput<typeof activeAppViewSchema> {}

export interface AtfundLink extends v.InferInput<typeof atfundLinkSchema> {}

export interface CertificationView extends v.InferInput<typeof certificationViewSchema> {}

export interface CoSpeakerView extends v.InferInput<typeof coSpeakerViewSchema> {}

export interface ContributorView extends v.InferInput<typeof contributorViewSchema> {}

export interface CourseView extends v.InferInput<typeof courseViewSchema> {}

export interface DurationView extends v.InferInput<typeof durationViewSchema> {}

export interface EducationView extends v.InferInput<typeof educationViewSchema> {}

export interface ExternalAccountView extends v.InferInput<typeof externalAccountViewSchema> {}

export interface HonorView extends v.InferInput<typeof honorViewSchema> {}

export interface InvolvementLinkView extends v.InferInput<typeof involvementLinkViewSchema> {}

export interface InvolvementView extends v.InferInput<typeof involvementViewSchema> {}

export interface LanguageView extends v.InferInput<typeof languageViewSchema> {}

export interface LocationView extends v.InferInput<typeof locationViewSchema> {}

export interface PdsProviderView extends v.InferInput<typeof pdsProviderViewSchema> {}

export interface PositionVerification extends v.InferInput<typeof positionVerificationSchema> {}

export interface PositionView extends v.InferInput<typeof positionViewSchema> {}

export interface PresentationDeliveryView extends v.InferInput<typeof presentationDeliveryViewSchema> {}

export interface PresentationView extends v.InferInput<typeof presentationViewSchema> {}

export interface ProfileView extends v.InferInput<typeof profileViewSchema> {}

export interface ProjectEventView extends v.InferInput<typeof projectEventViewSchema> {}

export interface ProjectMemberView extends v.InferInput<typeof projectMemberViewSchema> {}

export interface ProjectView extends v.InferInput<typeof projectViewSchema> {}

export interface PublicationView extends v.InferInput<typeof publicationViewSchema> {}

export interface SkillView extends v.InferInput<typeof skillViewSchema> {}

export interface VolunteeringView extends v.InferInput<typeof volunteeringViewSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;
declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		"id.sifa.getProfileView": mainSchema;
	}
}
