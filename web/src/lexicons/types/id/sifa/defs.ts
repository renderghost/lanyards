import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _advisorSchema = /*#__PURE__*/ v.literal("id.sifa.defs#advisor");
const _agentRefSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#agentRef")),
		/**
		 * DID of the referenced organization or person's atproto account, if one exists. The stable identity: it survives handle and name changes.
		 */
		"did": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Portable, app-neutral identifier for the referenced organization: a Wikidata Q-ID URI, a ROR URI, or an LEI URI, else a resolver URL. Enables deterministic resolution to a canonical entity even before the organization claims an atproto account. Absent for a bare person or a free-text entry.
		 */
		"entityRef": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * Human-readable label for the organization or person, as it was known when the record was saved. A point-in-time snapshot, not refreshed from a lookup.
		 * @maxLength 2560
		 * @maxGraphemes 256
		 */
		"name": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 2560),
				/*#__PURE__*/ v.stringGraphemes(0, 256)
			]
		),
	}
);
const _angelInvestmentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#angelInvestment");
const _apprenticeshipSchema = /*#__PURE__*/ v.literal("id.sifa.defs#apprenticeship");
const _artifactLinkSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#artifactLink")),
		/**
		 * What this link points to.
		 */
		"kind": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"article" | "commit" | "dataset" | "edit" | "issue" | "other" | "pull-request" | "release" | "review" | "slides" | "talk" | "thread" | "video" | (string & {})>()),
		/**
		 * Optional human-readable label (e.g. 'Merged PR #1234: keep-alive support').
		 * @maxLength 2000
		 * @maxGraphemes 200
		 */
		"label": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 2000),
				/*#__PURE__*/ v.stringGraphemes(0, 200)
			]
		)),
		/**
		 * URL of the artifact.
		 */
		"url": /*#__PURE__*/ v.genericUriString(),
	}
);
const _attestationDirectorySchema = /*#__PURE__*/ v.literal("id.sifa.defs#attestationDirectory");
const _attestationManualSchema = /*#__PURE__*/ v.literal("id.sifa.defs#attestationManual");
const _attestationSourceSchema = /*#__PURE__*/ v.string<"id.sifa.defs#attestationDirectory" | "id.sifa.defs#attestationManual" | (string & {})>();
const _authorSchema = /*#__PURE__*/ v.literal("id.sifa.defs#author");
const _beingMentoredSchema = /*#__PURE__*/ v.literal("id.sifa.defs#beingMentored");
const _boardMemberSchema = /*#__PURE__*/ v.literal("id.sifa.defs#boardMember");
const _boardObserverSchema = /*#__PURE__*/ v.literal("id.sifa.defs#boardObserver");
const _boardPositionsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#boardPositions");
const _businessSchema = /*#__PURE__*/ v.literal("id.sifa.defs#business");
const _coSpeakerSchema = /*#__PURE__*/ v.literal("id.sifa.defs#coSpeaker");
const _collaborationsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#collaborations");
const _collaboratorSchema = /*#__PURE__*/ v.literal("id.sifa.defs#collaborator");
const _colleagueSchema = /*#__PURE__*/ v.literal("id.sifa.defs#colleague");
const _commissionsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#commissions");
const _communitySchema = /*#__PURE__*/ v.literal("id.sifa.defs#community");
const _confirmationRelationSchema = /*#__PURE__*/ v.string<"id.sifa.defs#author" | "id.sifa.defs#coSpeaker" | "id.sifa.defs#collaborator" | "id.sifa.defs#colleague" | "id.sifa.defs#projectMember" | (string & {})>();
const _contextPersonalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#contextPersonal");
const _contextProfessionalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#contextProfessional");
const _contractSchema = /*#__PURE__*/ v.literal("id.sifa.defs#contract");
const _contractRolesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#contractRoles");
const _courseRoleSchema = /*#__PURE__*/ v.string<"id.sifa.defs#courseTaken" | "id.sifa.defs#courseTaught" | "id.sifa.defs#courseTeachingAssistant" | (string & {})>();
const _courseTakenSchema = /*#__PURE__*/ v.literal("id.sifa.defs#courseTaken");
const _courseTaughtSchema = /*#__PURE__*/ v.literal("id.sifa.defs#courseTaught");
const _courseTeachingAssistantSchema = /*#__PURE__*/ v.literal("id.sifa.defs#courseTeachingAssistant");
const _creativeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#creative");
const _domainAdvertisingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainAdvertising");
const _domainAerospaceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainAerospace");
const _domainAgritechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainAgritech");
const _domainAutomotiveSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainAutomotive");
const _domainAutonomousVehiclesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainAutonomousVehicles");
const _domainBankingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainBanking");
const _domainClimateTechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainClimateTech");
const _domainClinicalResearchSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainClinicalResearch");
const _domainComplianceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainCompliance");
const _domainCybersecuritySchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainCybersecurity");
const _domainDataScienceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainDataScience");
const _domainDefenseSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainDefense");
const _domainDevopsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainDevops");
const _domainDevrelSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainDevrel");
const _domainEcommerceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainEcommerce");
const _domainEdtechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainEdtech");
const _domainExtractionSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainExtraction");
const _domainFashionDesignSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainFashionDesign");
const _domainFilmVideoSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainFilmVideo");
const _domainFintechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainFintech");
const _domainFoodBeverageSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainFoodBeverage");
const _domainFoodTechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainFoodTech");
const _domainGameDevSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainGameDev");
const _domainGamingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainGaming");
const _domainGeologicalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainGeological");
const _domainHardwareSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHardware");
const _domainHealthtechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHealthtech");
const _domainHigherEdSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHigherEd");
const _domainHotelsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHotels");
const _domainHrRecruitmentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHrRecruitment");
const _domainHumanRightsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainHumanRights");
const _domainInsuranceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainInsurance");
const _domainInvestmentMgmtSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainInvestmentMgmt");
const _domainIpLawSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainIpLaw");
const _domainJournalismSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainJournalism");
const _domainLogisticsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainLogistics");
const _domainManagementConsultingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainManagementConsulting");
const _domainMobileServicesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainMobileServices");
const _domainNavalArchitectureSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainNavalArchitecture");
const _domainNetworkInfraSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainNetworkInfra");
const _domainOilGasSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainOilGas");
const _domainOpenSourceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainOpenSource");
const _domainPharmaSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainPharma");
const _domainPortOperationsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainPortOperations");
const _domainPrimarySecondarySchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainPrimarySecondary");
const _domainProductDesignSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainProductDesign");
const _domainProptechSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainProptech");
const _domainPublicPolicySchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainPublicPolicy");
const _domainRenewablesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainRenewables");
const _domainShippingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainShipping");
const _domainSoftwareEngineeringSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainSoftwareEngineering");
const _domainSupplyChainSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainSupplyChain");
const _domainTextileManufacturingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainTextileManufacturing");
const _domainTravelTourismSchema = /*#__PURE__*/ v.literal("id.sifa.defs#domainTravelTourism");
const _domainTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#domainAdvertising" | "id.sifa.defs#domainAerospace" | "id.sifa.defs#domainAgritech" | "id.sifa.defs#domainAutomotive" | "id.sifa.defs#domainAutonomousVehicles" | "id.sifa.defs#domainBanking" | "id.sifa.defs#domainClimateTech" | "id.sifa.defs#domainClinicalResearch" | "id.sifa.defs#domainCompliance" | "id.sifa.defs#domainCybersecurity" | "id.sifa.defs#domainDataScience" | "id.sifa.defs#domainDefense" | "id.sifa.defs#domainDevops" | "id.sifa.defs#domainDevrel" | "id.sifa.defs#domainEcommerce" | "id.sifa.defs#domainEdtech" | "id.sifa.defs#domainExtraction" | "id.sifa.defs#domainFashionDesign" | "id.sifa.defs#domainFilmVideo" | "id.sifa.defs#domainFintech" | "id.sifa.defs#domainFoodBeverage" | "id.sifa.defs#domainFoodTech" | "id.sifa.defs#domainGameDev" | "id.sifa.defs#domainGaming" | "id.sifa.defs#domainGeological" | "id.sifa.defs#domainHardware" | "id.sifa.defs#domainHealthtech" | "id.sifa.defs#domainHigherEd" | "id.sifa.defs#domainHotels" | "id.sifa.defs#domainHrRecruitment" | "id.sifa.defs#domainHumanRights" | "id.sifa.defs#domainInsurance" | "id.sifa.defs#domainInvestmentMgmt" | "id.sifa.defs#domainIpLaw" | "id.sifa.defs#domainJournalism" | "id.sifa.defs#domainLogistics" | "id.sifa.defs#domainManagementConsulting" | "id.sifa.defs#domainMobileServices" | "id.sifa.defs#domainNavalArchitecture" | "id.sifa.defs#domainNetworkInfra" | "id.sifa.defs#domainOilGas" | "id.sifa.defs#domainOpenSource" | "id.sifa.defs#domainPharma" | "id.sifa.defs#domainPortOperations" | "id.sifa.defs#domainPrimarySecondary" | "id.sifa.defs#domainProductDesign" | "id.sifa.defs#domainProptech" | "id.sifa.defs#domainPublicPolicy" | "id.sifa.defs#domainRenewables" | "id.sifa.defs#domainShipping" | "id.sifa.defs#domainSoftwareEngineering" | "id.sifa.defs#domainSupplyChain" | "id.sifa.defs#domainTextileManufacturing" | "id.sifa.defs#domainTravelTourism" | (string & {})>();
const _elementarySchema = /*#__PURE__*/ v.literal("id.sifa.defs#elementary");
const _employmentCurrentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#employmentCurrent");
const _employmentPastSchema = /*#__PURE__*/ v.literal("id.sifa.defs#employmentPast");
const _employmentStatusSchema = /*#__PURE__*/ v.string<"id.sifa.defs#employmentCurrent" | "id.sifa.defs#employmentPast" | (string & {})>();
const _employmentTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#advisor" | "id.sifa.defs#apprenticeship" | "id.sifa.defs#boardMember" | "id.sifa.defs#boardObserver" | "id.sifa.defs#contract" | "id.sifa.defs#fellowship" | "id.sifa.defs#freelance" | "id.sifa.defs#fullTime" | "id.sifa.defs#independentWork" | "id.sifa.defs#internship" | "id.sifa.defs#partTime" | "id.sifa.defs#seasonal" | "id.sifa.defs#selfEmployed" | "id.sifa.defs#temporary" | "id.sifa.defs#trainee" | "id.sifa.defs#volunteer" | (string & {})>();
const _externalPlatformSchema = /*#__PURE__*/ v.string<"id.sifa.defs#platformCodeberg" | "id.sifa.defs#platformFediverse" | "id.sifa.defs#platformForgejo" | "id.sifa.defs#platformGitea" | "id.sifa.defs#platformGithub" | "id.sifa.defs#platformGitlab" | "id.sifa.defs#platformInstagram" | "id.sifa.defs#platformLinkedin" | "id.sifa.defs#platformOrcid" | "id.sifa.defs#platformOther" | "id.sifa.defs#platformRss" | "id.sifa.defs#platformSubstack" | "id.sifa.defs#platformTwitter" | "id.sifa.defs#platformWebsite" | "id.sifa.defs#platformYoutube" | (string & {})>();
const _externalRecordRefSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#externalRecordRef")),
		/**
		 * Optional CID of a specific version of the referenced record. Used as an integrity hint only; live resolution is by AT-URI.
		 */
		"cid": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		/**
		 * AT-URI of the referenced record.
		 */
		"uri": /*#__PURE__*/ v.resourceUriString(),
	}
);
const _fellowshipSchema = /*#__PURE__*/ v.literal("id.sifa.defs#fellowship");
const _freelanceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#freelance");
const _fullProfessionalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#fullProfessional");
const _fullTimeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#fullTime");
const _fullTimeRolesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#fullTimeRoles");
const _honorAwardSchema = /*#__PURE__*/ v.literal("id.sifa.defs#honorAward");
const _honorChampionshipSchema = /*#__PURE__*/ v.literal("id.sifa.defs#honorChampionship");
const _honorNominationSchema = /*#__PURE__*/ v.literal("id.sifa.defs#honorNomination");
const _honorRecognitionSchema = /*#__PURE__*/ v.literal("id.sifa.defs#honorRecognition");
const _honorRecordSchema = /*#__PURE__*/ v.literal("id.sifa.defs#honorRecord");
const _hostSchema = /*#__PURE__*/ v.literal("id.sifa.defs#host");
const _hybridSchema = /*#__PURE__*/ v.literal("id.sifa.defs#hybrid");
const _independentWorkSchema = /*#__PURE__*/ v.literal("id.sifa.defs#independentWork");
const _industrySchema = /*#__PURE__*/ v.literal("id.sifa.defs#industry");
const _industryAgricultureSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryAgriculture");
const _industryConsultingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryConsulting");
const _industryDomainSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#industryDomain")),
		/**
		 * Professional domain within the selected industry. Optional refinement.
		 */
		"domain": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#domainAdvertising" | "id.sifa.defs#domainAerospace" | "id.sifa.defs#domainAgritech" | "id.sifa.defs#domainAutomotive" | "id.sifa.defs#domainAutonomousVehicles" | "id.sifa.defs#domainBanking" | "id.sifa.defs#domainClimateTech" | "id.sifa.defs#domainClinicalResearch" | "id.sifa.defs#domainCompliance" | "id.sifa.defs#domainCybersecurity" | "id.sifa.defs#domainDataScience" | "id.sifa.defs#domainDefense" | "id.sifa.defs#domainDevops" | "id.sifa.defs#domainDevrel" | "id.sifa.defs#domainEcommerce" | "id.sifa.defs#domainEdtech" | "id.sifa.defs#domainExtraction" | "id.sifa.defs#domainFashionDesign" | "id.sifa.defs#domainFilmVideo" | "id.sifa.defs#domainFintech" | "id.sifa.defs#domainFoodBeverage" | "id.sifa.defs#domainFoodTech" | "id.sifa.defs#domainGameDev" | "id.sifa.defs#domainGaming" | "id.sifa.defs#domainGeological" | "id.sifa.defs#domainHardware" | "id.sifa.defs#domainHealthtech" | "id.sifa.defs#domainHigherEd" | "id.sifa.defs#domainHotels" | "id.sifa.defs#domainHrRecruitment" | "id.sifa.defs#domainHumanRights" | "id.sifa.defs#domainInsurance" | "id.sifa.defs#domainInvestmentMgmt" | "id.sifa.defs#domainIpLaw" | "id.sifa.defs#domainJournalism" | "id.sifa.defs#domainLogistics" | "id.sifa.defs#domainManagementConsulting" | "id.sifa.defs#domainMobileServices" | "id.sifa.defs#domainNavalArchitecture" | "id.sifa.defs#domainNetworkInfra" | "id.sifa.defs#domainOilGas" | "id.sifa.defs#domainOpenSource" | "id.sifa.defs#domainPharma" | "id.sifa.defs#domainPortOperations" | "id.sifa.defs#domainPrimarySecondary" | "id.sifa.defs#domainProductDesign" | "id.sifa.defs#domainProptech" | "id.sifa.defs#domainPublicPolicy" | "id.sifa.defs#domainRenewables" | "id.sifa.defs#domainShipping" | "id.sifa.defs#domainSoftwareEngineering" | "id.sifa.defs#domainSupplyChain" | "id.sifa.defs#domainTextileManufacturing" | "id.sifa.defs#domainTravelTourism" | (string & {})>()),
		/**
		 * Professional industry sector token.
		 */
		"industry": /*#__PURE__*/ v.string<"id.sifa.defs#industryAgriculture" | "id.sifa.defs#industryConsulting" | "id.sifa.defs#industryEducation" | "id.sifa.defs#industryEnergy" | "id.sifa.defs#industryFashion" | "id.sifa.defs#industryFinance" | "id.sifa.defs#industryGovernment" | "id.sifa.defs#industryHealthcare" | "id.sifa.defs#industryHospitality" | "id.sifa.defs#industryLegal" | "id.sifa.defs#industryManufacturing" | "id.sifa.defs#industryMaritime" | "id.sifa.defs#industryMedia" | "id.sifa.defs#industryMining" | "id.sifa.defs#industryNonprofit" | "id.sifa.defs#industryOther" | "id.sifa.defs#industryRealEstate" | "id.sifa.defs#industryRetail" | "id.sifa.defs#industryTechnology" | "id.sifa.defs#industryTelecom" | "id.sifa.defs#industryTransport" | (string & {})>(),
	}
);
const _industryEducationSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryEducation");
const _industryEnergySchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryEnergy");
const _industryFashionSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryFashion");
const _industryFinanceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryFinance");
const _industryGovernmentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryGovernment");
const _industryHealthcareSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryHealthcare");
const _industryHospitalitySchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryHospitality");
const _industryLegalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryLegal");
const _industryManufacturingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryManufacturing");
const _industryMaritimeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryMaritime");
const _industryMediaSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryMedia");
const _industryMiningSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryMining");
const _industryNonprofitSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryNonprofit");
const _industryOtherSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryOther");
const _industryRealEstateSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryRealEstate");
const _industryRetailSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryRetail");
const _industryTechnologySchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryTechnology");
const _industryTelecomSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryTelecom");
const _industryTransportSchema = /*#__PURE__*/ v.literal("id.sifa.defs#industryTransport");
const _industryTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#industryAgriculture" | "id.sifa.defs#industryConsulting" | "id.sifa.defs#industryEducation" | "id.sifa.defs#industryEnergy" | "id.sifa.defs#industryFashion" | "id.sifa.defs#industryFinance" | "id.sifa.defs#industryGovernment" | "id.sifa.defs#industryHealthcare" | "id.sifa.defs#industryHospitality" | "id.sifa.defs#industryLegal" | "id.sifa.defs#industryManufacturing" | "id.sifa.defs#industryMaritime" | "id.sifa.defs#industryMedia" | "id.sifa.defs#industryMining" | "id.sifa.defs#industryNonprofit" | "id.sifa.defs#industryOther" | "id.sifa.defs#industryRealEstate" | "id.sifa.defs#industryRetail" | "id.sifa.defs#industryTechnology" | "id.sifa.defs#industryTelecom" | "id.sifa.defs#industryTransport" | (string & {})>();
const _internshipSchema = /*#__PURE__*/ v.literal("id.sifa.defs#internship");
const _interpersonalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#interpersonal");
const _investmentActiveSchema = /*#__PURE__*/ v.literal("id.sifa.defs#investmentActive");
const _investmentAmountSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#investmentAmount")),
		/**
		 * ISO 4217 three-letter currency code, uppercase. Enforced at the app layer.
		 * @minLength 3
		 * @maxLength 3
		 */
		"currency": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[/*#__PURE__*/ v.stringLength(3, 3)]
		),
		/**
		 * Amount in whole major currency units (euros, not cents). Cheque sizes are round numbers, and whole units avoid the ambiguity of a bare figure.
		 * @minimum 0
		 */
		"value": /*#__PURE__*/ v.integer(),
	}
);
const _investmentExitedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#investmentExited");
const _investmentRoleSchema = /*#__PURE__*/ v.string<"id.sifa.defs#angelInvestment" | "id.sifa.defs#limitedPartner" | "id.sifa.defs#otherInvestment" | "id.sifa.defs#syndicateInvestment" | (string & {})>();
const _investmentStageSchema = /*#__PURE__*/ v.string<"id.sifa.defs#stageGrowth" | "id.sifa.defs#stageOther" | "id.sifa.defs#stagePreSeed" | "id.sifa.defs#stageSecondary" | "id.sifa.defs#stageSeed" | "id.sifa.defs#stageSeriesA" | "id.sifa.defs#stageSeriesB" | "id.sifa.defs#stageSeriesCPlus" | (string & {})>();
const _investmentStatusSchema = /*#__PURE__*/ v.string<"id.sifa.defs#investmentActive" | "id.sifa.defs#investmentExited" | "id.sifa.defs#investmentUndisclosed" | "id.sifa.defs#investmentWrittenOff" | (string & {})>();
const _investmentUndisclosedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#investmentUndisclosed");
const _investmentWrittenOffSchema = /*#__PURE__*/ v.literal("id.sifa.defs#investmentWrittenOff");
const _involvementCharitySchema = /*#__PURE__*/ v.literal("id.sifa.defs#involvementCharity");
const _involvementCivicSchema = /*#__PURE__*/ v.literal("id.sifa.defs#involvementCivic");
const _involvementCommunitySchema = /*#__PURE__*/ v.literal("id.sifa.defs#involvementCommunity");
const _involvementKindSchema = /*#__PURE__*/ v.string<"id.sifa.defs#involvementCharity" | "id.sifa.defs#involvementCivic" | "id.sifa.defs#involvementCommunity" | "id.sifa.defs#involvementOpenSource" | "id.sifa.defs#involvementOther" | (string & {})>();
const _involvementOpenSourceSchema = /*#__PURE__*/ v.literal("id.sifa.defs#involvementOpenSource");
const _involvementOtherSchema = /*#__PURE__*/ v.literal("id.sifa.defs#involvementOther");
const _keynoteSchema = /*#__PURE__*/ v.literal("id.sifa.defs#keynote");
const _languageSchema = /*#__PURE__*/ v.literal("id.sifa.defs#language");
const _limitedPartnerSchema = /*#__PURE__*/ v.literal("id.sifa.defs#limitedPartner");
const _limitedWorkingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#limitedWorking");
const _linkEventSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkEvent");
const _linkOtherSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkOther");
const _linkRecordingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkRecording");
const _linkRegistrationSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkRegistration");
const _linkSlidesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkSlides");
const _linkWriteupSchema = /*#__PURE__*/ v.literal("id.sifa.defs#linkWriteup");
const _locationBusinessSchema = /*#__PURE__*/ v.literal("id.sifa.defs#locationBusiness");
const _locationPrimarySchema = /*#__PURE__*/ v.literal("id.sifa.defs#locationPrimary");
const _locationTravelSchema = /*#__PURE__*/ v.literal("id.sifa.defs#locationTravel");
const _locationTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#locationBusiness" | "id.sifa.defs#locationPrimary" | "id.sifa.defs#locationTravel" | (string & {})>();
const _mentoringOthersSchema = /*#__PURE__*/ v.literal("id.sifa.defs#mentoringOthers");
const _nativeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#native");
const _onSiteSchema = /*#__PURE__*/ v.literal("id.sifa.defs#onSite");
const _openToWorkStatusSchema = /*#__PURE__*/ v.string<"id.sifa.defs#beingMentored" | "id.sifa.defs#boardPositions" | "id.sifa.defs#collaborations" | "id.sifa.defs#commissions" | "id.sifa.defs#contractRoles" | "id.sifa.defs#fullTimeRoles" | "id.sifa.defs#mentoringOthers" | "id.sifa.defs#partTimeRoles" | "id.sifa.defs#speakingEngagements" | (string & {})>();
const _otherInvestmentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#otherInvestment");
const _panelistSchema = /*#__PURE__*/ v.literal("id.sifa.defs#panelist");
const _partTimeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#partTime");
const _partTimeRolesSchema = /*#__PURE__*/ v.literal("id.sifa.defs#partTimeRoles");
const _platformCodebergSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformCodeberg");
const _platformFediverseSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformFediverse");
const _platformForgejoSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformForgejo");
const _platformGiteaSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformGitea");
const _platformGithubSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformGithub");
const _platformGitlabSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformGitlab");
const _platformInstagramSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformInstagram");
const _platformLinkedinSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformLinkedin");
const _platformOrcidSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformOrcid");
const _platformOtherSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformOther");
const _platformRssSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformRss");
const _platformSubstackSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformSubstack");
const _platformTwitterSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformTwitter");
const _platformWebsiteSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformWebsite");
const _platformYoutubeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#platformYoutube");
const _presentationLinkSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#presentationLink")),
		/**
		 * Optional display label (e.g., 'Watch recording', 'Slides').
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
		 * Optional link category, used to pick an icon. Open set; see id.sifa.defs#presentationLinkType.
		 */
		"type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#linkEvent" | "id.sifa.defs#linkOther" | "id.sifa.defs#linkRecording" | "id.sifa.defs#linkRegistration" | "id.sifa.defs#linkSlides" | "id.sifa.defs#linkWriteup" | (string & {})>()),
		/**
		 * The link URL.
		 */
		"uri": /*#__PURE__*/ v.genericUriString(),
	}
);
const _presentationLinkTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#linkEvent" | "id.sifa.defs#linkOther" | "id.sifa.defs#linkRecording" | "id.sifa.defs#linkRegistration" | "id.sifa.defs#linkSlides" | "id.sifa.defs#linkWriteup" | (string & {})>();
const _presentationRoleSchema = /*#__PURE__*/ v.string<"id.sifa.defs#host" | "id.sifa.defs#keynote" | "id.sifa.defs#panelist" | "id.sifa.defs#presenter" | "id.sifa.defs#workshop" | (string & {})>();
const _presenterSchema = /*#__PURE__*/ v.literal("id.sifa.defs#presenter");
const _professionalWorkingSchema = /*#__PURE__*/ v.literal("id.sifa.defs#professionalWorking");
const _proficiencySchema = /*#__PURE__*/ v.string<"id.sifa.defs#elementary" | "id.sifa.defs#fullProfessional" | "id.sifa.defs#limitedWorking" | "id.sifa.defs#native" | "id.sifa.defs#professionalWorking" | (string & {})>();
const _projectActiveSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectActive");
const _projectArchivedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectArchived");
const _projectCompletedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectCompleted");
const _projectContributorSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectContributor");
const _projectCoreSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectCore");
const _projectMemberSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectMember");
const _projectMemberRefSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#projectMemberRef")),
		/**
		 * DID of the person named as a project member. Any atproto account is allowed.
		 */
		"did": /*#__PURE__*/ v.didString(),
		/**
		 * Role the named person held on the project. Display only: it grants no write access to the project record, which lives in the author's repository.
		 */
		"role": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<"id.sifa.defs#projectContributor" | "id.sifa.defs#projectCore" | "id.sifa.defs#projectOwner" | (string & {})>()),
		/**
		 * Optional title within the project (e.g. 'Lead Designer', 'Backend Engineer').
		 * @maxLength 1280
		 * @maxGraphemes 128
		 */
		"title": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[
				/*#__PURE__*/ v.stringLength(0, 1280),
				/*#__PURE__*/ v.stringGraphemes(0, 128)
			]
		)),
	}
);
const _projectOwnerSchema = /*#__PURE__*/ v.literal("id.sifa.defs#projectOwner");
const _projectRoleSchema = /*#__PURE__*/ v.string<"id.sifa.defs#projectContributor" | "id.sifa.defs#projectCore" | "id.sifa.defs#projectOwner" | (string & {})>();
const _projectStatusSchema = /*#__PURE__*/ v.string<"id.sifa.defs#projectActive" | "id.sifa.defs#projectArchived" | "id.sifa.defs#projectCompleted" | (string & {})>();
const _relatedIdentifierSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#relatedIdentifier")),
		/**
		 * The related work: a bare DOI ("10.1234/example"), an AT-URI of another record, or a URL, as named by identifierType.
		 * @maxLength 2048
		 */
		"identifier": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string(),
			[/*#__PURE__*/ v.stringLength(0, 2048)]
		),
		/**
		 * Kind of identifier. Absent means DOI.
		 * @maxLength 32
		 */
		"identifierType": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string<"AT-URI" | "DOI" | "URL" | (string & {})>(),
			[/*#__PURE__*/ v.stringLength(0, 32)]
		)),
		/**
		 * How this work relates to the identified one, in DataCite relationType terms. For example IsPreprintOf on a preprint points at its published version.
		 * @maxLength 64
		 */
		"relationType": /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string<"HasPreprint" | "HasVersion" | "IsIdenticalTo" | "IsNewVersionOf" | "IsPreprintOf" | "IsPreviousVersionOf" | "IsPublishedIn" | "IsVersionOf" | (string & {})>(),
			[/*#__PURE__*/ v.stringLength(0, 64)]
		),
	}
);
const _remoteSchema = /*#__PURE__*/ v.literal("id.sifa.defs#remote");
const _remoteGlobalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#remoteGlobal");
const _remoteLocalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#remoteLocal");
const _remoteRegionSchema = /*#__PURE__*/ v.literal("id.sifa.defs#remoteRegion");
const _seasonalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#seasonal");
const _securitySchema = /*#__PURE__*/ v.literal("id.sifa.defs#security");
const _selfEmployedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#selfEmployed");
const _skillCategorySchema = /*#__PURE__*/ v.string<"id.sifa.defs#business" | "id.sifa.defs#community" | "id.sifa.defs#creative" | "id.sifa.defs#industry" | "id.sifa.defs#interpersonal" | "id.sifa.defs#security" | "id.sifa.defs#technical" | (string & {})>();
const _skillRefSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#skillRef")),
		/**
		 * AT-URI of the id.sifa.profile.skill record.
		 */
		"uri": /*#__PURE__*/ v.resourceUriString(),
	}
);
const _speakingEngagementsSchema = /*#__PURE__*/ v.literal("id.sifa.defs#speakingEngagements");
const _stageGrowthSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageGrowth");
const _stageOtherSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageOther");
const _stagePreSeedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stagePreSeed");
const _stageSecondarySchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageSecondary");
const _stageSeedSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageSeed");
const _stageSeriesASchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageSeriesA");
const _stageSeriesBSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageSeriesB");
const _stageSeriesCPlusSchema = /*#__PURE__*/ v.literal("id.sifa.defs#stageSeriesCPlus");
const _syndicateInvestmentSchema = /*#__PURE__*/ v.literal("id.sifa.defs#syndicateInvestment");
const _technicalSchema = /*#__PURE__*/ v.literal("id.sifa.defs#technical");
const _temporarySchema = /*#__PURE__*/ v.literal("id.sifa.defs#temporary");
const _toolRefSchema = /*#__PURE__*/ v.object(
	{
		"$type": /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal("id.sifa.defs#toolRef")),
		/**
		 * AT-URI of a tool item record in the same repo.
		 */
		"uri": /*#__PURE__*/ v.resourceUriString(),
	}
);
const _traineeSchema = /*#__PURE__*/ v.literal("id.sifa.defs#trainee");
const _verificationMethodSchema = /*#__PURE__*/ v.string<"id.sifa.defs#verifiedByDirectory" | "id.sifa.defs#verifiedByEmail" | "id.sifa.defs#verifiedByOrg" | "id.sifa.defs#verifiedByPeer" | (string & {})>();
const _verifiedByDirectorySchema = /*#__PURE__*/ v.literal("id.sifa.defs#verifiedByDirectory");
const _verifiedByEmailSchema = /*#__PURE__*/ v.literal("id.sifa.defs#verifiedByEmail");
const _verifiedByOrgSchema = /*#__PURE__*/ v.literal("id.sifa.defs#verifiedByOrg");
const _verifiedByPeerSchema = /*#__PURE__*/ v.literal("id.sifa.defs#verifiedByPeer");
const _volunteerSchema = /*#__PURE__*/ v.literal("id.sifa.defs#volunteer");
const _workplaceTypeSchema = /*#__PURE__*/ v.string<"id.sifa.defs#hybrid" | "id.sifa.defs#onSite" | "id.sifa.defs#remote" | "id.sifa.defs#remoteGlobal" | "id.sifa.defs#remoteLocal" | "id.sifa.defs#remoteRegion" | (string & {})>();
const _workshopSchema = /*#__PURE__*/ v.literal("id.sifa.defs#workshop");
type advisor$schematype = typeof _advisorSchema;
type agentRef$schematype = typeof _agentRefSchema;
type angelInvestment$schematype = typeof _angelInvestmentSchema;
type apprenticeship$schematype = typeof _apprenticeshipSchema;
type artifactLink$schematype = typeof _artifactLinkSchema;
type attestationDirectory$schematype = typeof _attestationDirectorySchema;
type attestationManual$schematype = typeof _attestationManualSchema;
type attestationSource$schematype = typeof _attestationSourceSchema;
type author$schematype = typeof _authorSchema;
type beingMentored$schematype = typeof _beingMentoredSchema;
type boardMember$schematype = typeof _boardMemberSchema;
type boardObserver$schematype = typeof _boardObserverSchema;
type boardPositions$schematype = typeof _boardPositionsSchema;
type business$schematype = typeof _businessSchema;
type coSpeaker$schematype = typeof _coSpeakerSchema;
type collaborations$schematype = typeof _collaborationsSchema;
type collaborator$schematype = typeof _collaboratorSchema;
type colleague$schematype = typeof _colleagueSchema;
type commissions$schematype = typeof _commissionsSchema;
type community$schematype = typeof _communitySchema;
type confirmationRelation$schematype = typeof _confirmationRelationSchema;
type contextPersonal$schematype = typeof _contextPersonalSchema;
type contextProfessional$schematype = typeof _contextProfessionalSchema;
type contract$schematype = typeof _contractSchema;
type contractRoles$schematype = typeof _contractRolesSchema;
type courseRole$schematype = typeof _courseRoleSchema;
type courseTaken$schematype = typeof _courseTakenSchema;
type courseTaught$schematype = typeof _courseTaughtSchema;
type courseTeachingAssistant$schematype = typeof _courseTeachingAssistantSchema;
type creative$schematype = typeof _creativeSchema;
type domainAdvertising$schematype = typeof _domainAdvertisingSchema;
type domainAerospace$schematype = typeof _domainAerospaceSchema;
type domainAgritech$schematype = typeof _domainAgritechSchema;
type domainAutomotive$schematype = typeof _domainAutomotiveSchema;
type domainAutonomousVehicles$schematype = typeof _domainAutonomousVehiclesSchema;
type domainBanking$schematype = typeof _domainBankingSchema;
type domainClimateTech$schematype = typeof _domainClimateTechSchema;
type domainClinicalResearch$schematype = typeof _domainClinicalResearchSchema;
type domainCompliance$schematype = typeof _domainComplianceSchema;
type domainCybersecurity$schematype = typeof _domainCybersecuritySchema;
type domainDataScience$schematype = typeof _domainDataScienceSchema;
type domainDefense$schematype = typeof _domainDefenseSchema;
type domainDevops$schematype = typeof _domainDevopsSchema;
type domainDevrel$schematype = typeof _domainDevrelSchema;
type domainEcommerce$schematype = typeof _domainEcommerceSchema;
type domainEdtech$schematype = typeof _domainEdtechSchema;
type domainExtraction$schematype = typeof _domainExtractionSchema;
type domainFashionDesign$schematype = typeof _domainFashionDesignSchema;
type domainFilmVideo$schematype = typeof _domainFilmVideoSchema;
type domainFintech$schematype = typeof _domainFintechSchema;
type domainFoodBeverage$schematype = typeof _domainFoodBeverageSchema;
type domainFoodTech$schematype = typeof _domainFoodTechSchema;
type domainGameDev$schematype = typeof _domainGameDevSchema;
type domainGaming$schematype = typeof _domainGamingSchema;
type domainGeological$schematype = typeof _domainGeologicalSchema;
type domainHardware$schematype = typeof _domainHardwareSchema;
type domainHealthtech$schematype = typeof _domainHealthtechSchema;
type domainHigherEd$schematype = typeof _domainHigherEdSchema;
type domainHotels$schematype = typeof _domainHotelsSchema;
type domainHrRecruitment$schematype = typeof _domainHrRecruitmentSchema;
type domainHumanRights$schematype = typeof _domainHumanRightsSchema;
type domainInsurance$schematype = typeof _domainInsuranceSchema;
type domainInvestmentMgmt$schematype = typeof _domainInvestmentMgmtSchema;
type domainIpLaw$schematype = typeof _domainIpLawSchema;
type domainJournalism$schematype = typeof _domainJournalismSchema;
type domainLogistics$schematype = typeof _domainLogisticsSchema;
type domainManagementConsulting$schematype = typeof _domainManagementConsultingSchema;
type domainMobileServices$schematype = typeof _domainMobileServicesSchema;
type domainNavalArchitecture$schematype = typeof _domainNavalArchitectureSchema;
type domainNetworkInfra$schematype = typeof _domainNetworkInfraSchema;
type domainOilGas$schematype = typeof _domainOilGasSchema;
type domainOpenSource$schematype = typeof _domainOpenSourceSchema;
type domainPharma$schematype = typeof _domainPharmaSchema;
type domainPortOperations$schematype = typeof _domainPortOperationsSchema;
type domainPrimarySecondary$schematype = typeof _domainPrimarySecondarySchema;
type domainProductDesign$schematype = typeof _domainProductDesignSchema;
type domainProptech$schematype = typeof _domainProptechSchema;
type domainPublicPolicy$schematype = typeof _domainPublicPolicySchema;
type domainRenewables$schematype = typeof _domainRenewablesSchema;
type domainShipping$schematype = typeof _domainShippingSchema;
type domainSoftwareEngineering$schematype = typeof _domainSoftwareEngineeringSchema;
type domainSupplyChain$schematype = typeof _domainSupplyChainSchema;
type domainTextileManufacturing$schematype = typeof _domainTextileManufacturingSchema;
type domainTravelTourism$schematype = typeof _domainTravelTourismSchema;
type domainType$schematype = typeof _domainTypeSchema;
type elementary$schematype = typeof _elementarySchema;
type employmentCurrent$schematype = typeof _employmentCurrentSchema;
type employmentPast$schematype = typeof _employmentPastSchema;
type employmentStatus$schematype = typeof _employmentStatusSchema;
type employmentType$schematype = typeof _employmentTypeSchema;
type externalPlatform$schematype = typeof _externalPlatformSchema;
type externalRecordRef$schematype = typeof _externalRecordRefSchema;
type fellowship$schematype = typeof _fellowshipSchema;
type freelance$schematype = typeof _freelanceSchema;
type fullProfessional$schematype = typeof _fullProfessionalSchema;
type fullTime$schematype = typeof _fullTimeSchema;
type fullTimeRoles$schematype = typeof _fullTimeRolesSchema;
type honorAward$schematype = typeof _honorAwardSchema;
type honorChampionship$schematype = typeof _honorChampionshipSchema;
type honorNomination$schematype = typeof _honorNominationSchema;
type honorRecognition$schematype = typeof _honorRecognitionSchema;
type honorRecord$schematype = typeof _honorRecordSchema;
type host$schematype = typeof _hostSchema;
type hybrid$schematype = typeof _hybridSchema;
type independentWork$schematype = typeof _independentWorkSchema;
type industry$schematype = typeof _industrySchema;
type industryAgriculture$schematype = typeof _industryAgricultureSchema;
type industryConsulting$schematype = typeof _industryConsultingSchema;
type industryDomain$schematype = typeof _industryDomainSchema;
type industryEducation$schematype = typeof _industryEducationSchema;
type industryEnergy$schematype = typeof _industryEnergySchema;
type industryFashion$schematype = typeof _industryFashionSchema;
type industryFinance$schematype = typeof _industryFinanceSchema;
type industryGovernment$schematype = typeof _industryGovernmentSchema;
type industryHealthcare$schematype = typeof _industryHealthcareSchema;
type industryHospitality$schematype = typeof _industryHospitalitySchema;
type industryLegal$schematype = typeof _industryLegalSchema;
type industryManufacturing$schematype = typeof _industryManufacturingSchema;
type industryMaritime$schematype = typeof _industryMaritimeSchema;
type industryMedia$schematype = typeof _industryMediaSchema;
type industryMining$schematype = typeof _industryMiningSchema;
type industryNonprofit$schematype = typeof _industryNonprofitSchema;
type industryOther$schematype = typeof _industryOtherSchema;
type industryRealEstate$schematype = typeof _industryRealEstateSchema;
type industryRetail$schematype = typeof _industryRetailSchema;
type industryTechnology$schematype = typeof _industryTechnologySchema;
type industryTelecom$schematype = typeof _industryTelecomSchema;
type industryTransport$schematype = typeof _industryTransportSchema;
type industryType$schematype = typeof _industryTypeSchema;
type internship$schematype = typeof _internshipSchema;
type interpersonal$schematype = typeof _interpersonalSchema;
type investmentActive$schematype = typeof _investmentActiveSchema;
type investmentAmount$schematype = typeof _investmentAmountSchema;
type investmentExited$schematype = typeof _investmentExitedSchema;
type investmentRole$schematype = typeof _investmentRoleSchema;
type investmentStage$schematype = typeof _investmentStageSchema;
type investmentStatus$schematype = typeof _investmentStatusSchema;
type investmentUndisclosed$schematype = typeof _investmentUndisclosedSchema;
type investmentWrittenOff$schematype = typeof _investmentWrittenOffSchema;
type involvementCharity$schematype = typeof _involvementCharitySchema;
type involvementCivic$schematype = typeof _involvementCivicSchema;
type involvementCommunity$schematype = typeof _involvementCommunitySchema;
type involvementKind$schematype = typeof _involvementKindSchema;
type involvementOpenSource$schematype = typeof _involvementOpenSourceSchema;
type involvementOther$schematype = typeof _involvementOtherSchema;
type keynote$schematype = typeof _keynoteSchema;
type language$schematype = typeof _languageSchema;
type limitedPartner$schematype = typeof _limitedPartnerSchema;
type limitedWorking$schematype = typeof _limitedWorkingSchema;
type linkEvent$schematype = typeof _linkEventSchema;
type linkOther$schematype = typeof _linkOtherSchema;
type linkRecording$schematype = typeof _linkRecordingSchema;
type linkRegistration$schematype = typeof _linkRegistrationSchema;
type linkSlides$schematype = typeof _linkSlidesSchema;
type linkWriteup$schematype = typeof _linkWriteupSchema;
type locationBusiness$schematype = typeof _locationBusinessSchema;
type locationPrimary$schematype = typeof _locationPrimarySchema;
type locationTravel$schematype = typeof _locationTravelSchema;
type locationType$schematype = typeof _locationTypeSchema;
type mentoringOthers$schematype = typeof _mentoringOthersSchema;
type native$schematype = typeof _nativeSchema;
type onSite$schematype = typeof _onSiteSchema;
type openToWorkStatus$schematype = typeof _openToWorkStatusSchema;
type otherInvestment$schematype = typeof _otherInvestmentSchema;
type panelist$schematype = typeof _panelistSchema;
type partTime$schematype = typeof _partTimeSchema;
type partTimeRoles$schematype = typeof _partTimeRolesSchema;
type platformCodeberg$schematype = typeof _platformCodebergSchema;
type platformFediverse$schematype = typeof _platformFediverseSchema;
type platformForgejo$schematype = typeof _platformForgejoSchema;
type platformGitea$schematype = typeof _platformGiteaSchema;
type platformGithub$schematype = typeof _platformGithubSchema;
type platformGitlab$schematype = typeof _platformGitlabSchema;
type platformInstagram$schematype = typeof _platformInstagramSchema;
type platformLinkedin$schematype = typeof _platformLinkedinSchema;
type platformOrcid$schematype = typeof _platformOrcidSchema;
type platformOther$schematype = typeof _platformOtherSchema;
type platformRss$schematype = typeof _platformRssSchema;
type platformSubstack$schematype = typeof _platformSubstackSchema;
type platformTwitter$schematype = typeof _platformTwitterSchema;
type platformWebsite$schematype = typeof _platformWebsiteSchema;
type platformYoutube$schematype = typeof _platformYoutubeSchema;
type presentationLink$schematype = typeof _presentationLinkSchema;
type presentationLinkType$schematype = typeof _presentationLinkTypeSchema;
type presentationRole$schematype = typeof _presentationRoleSchema;
type presenter$schematype = typeof _presenterSchema;
type professionalWorking$schematype = typeof _professionalWorkingSchema;
type proficiency$schematype = typeof _proficiencySchema;
type projectActive$schematype = typeof _projectActiveSchema;
type projectArchived$schematype = typeof _projectArchivedSchema;
type projectCompleted$schematype = typeof _projectCompletedSchema;
type projectContributor$schematype = typeof _projectContributorSchema;
type projectCore$schematype = typeof _projectCoreSchema;
type projectMember$schematype = typeof _projectMemberSchema;
type projectMemberRef$schematype = typeof _projectMemberRefSchema;
type projectOwner$schematype = typeof _projectOwnerSchema;
type projectRole$schematype = typeof _projectRoleSchema;
type projectStatus$schematype = typeof _projectStatusSchema;
type relatedIdentifier$schematype = typeof _relatedIdentifierSchema;
type remote$schematype = typeof _remoteSchema;
type remoteGlobal$schematype = typeof _remoteGlobalSchema;
type remoteLocal$schematype = typeof _remoteLocalSchema;
type remoteRegion$schematype = typeof _remoteRegionSchema;
type seasonal$schematype = typeof _seasonalSchema;
type security$schematype = typeof _securitySchema;
type selfEmployed$schematype = typeof _selfEmployedSchema;
type skillCategory$schematype = typeof _skillCategorySchema;
type skillRef$schematype = typeof _skillRefSchema;
type speakingEngagements$schematype = typeof _speakingEngagementsSchema;
type stageGrowth$schematype = typeof _stageGrowthSchema;
type stageOther$schematype = typeof _stageOtherSchema;
type stagePreSeed$schematype = typeof _stagePreSeedSchema;
type stageSecondary$schematype = typeof _stageSecondarySchema;
type stageSeed$schematype = typeof _stageSeedSchema;
type stageSeriesA$schematype = typeof _stageSeriesASchema;
type stageSeriesB$schematype = typeof _stageSeriesBSchema;
type stageSeriesCPlus$schematype = typeof _stageSeriesCPlusSchema;
type syndicateInvestment$schematype = typeof _syndicateInvestmentSchema;
type technical$schematype = typeof _technicalSchema;
type temporary$schematype = typeof _temporarySchema;
type toolRef$schematype = typeof _toolRefSchema;
type trainee$schematype = typeof _traineeSchema;
type verificationMethod$schematype = typeof _verificationMethodSchema;
type verifiedByDirectory$schematype = typeof _verifiedByDirectorySchema;
type verifiedByEmail$schematype = typeof _verifiedByEmailSchema;
type verifiedByOrg$schematype = typeof _verifiedByOrgSchema;
type verifiedByPeer$schematype = typeof _verifiedByPeerSchema;
type volunteer$schematype = typeof _volunteerSchema;
type workplaceType$schematype = typeof _workplaceTypeSchema;
type workshop$schematype = typeof _workshopSchema;

export interface advisorSchema extends advisor$schematype {}

export interface agentRefSchema extends agentRef$schematype {}

export interface angelInvestmentSchema extends angelInvestment$schematype {}

export interface apprenticeshipSchema extends apprenticeship$schematype {}

export interface artifactLinkSchema extends artifactLink$schematype {}

export interface attestationDirectorySchema extends attestationDirectory$schematype {}

export interface attestationManualSchema extends attestationManual$schematype {}

export interface attestationSourceSchema extends attestationSource$schematype {}

export interface authorSchema extends author$schematype {}

export interface beingMentoredSchema extends beingMentored$schematype {}

export interface boardMemberSchema extends boardMember$schematype {}

export interface boardObserverSchema extends boardObserver$schematype {}

export interface boardPositionsSchema extends boardPositions$schematype {}

export interface businessSchema extends business$schematype {}

export interface coSpeakerSchema extends coSpeaker$schematype {}

export interface collaborationsSchema extends collaborations$schematype {}

export interface collaboratorSchema extends collaborator$schematype {}

export interface colleagueSchema extends colleague$schematype {}

export interface commissionsSchema extends commissions$schematype {}

export interface communitySchema extends community$schematype {}

export interface confirmationRelationSchema extends confirmationRelation$schematype {}

export interface contextPersonalSchema extends contextPersonal$schematype {}

export interface contextProfessionalSchema extends contextProfessional$schematype {}

export interface contractSchema extends contract$schematype {}

export interface contractRolesSchema extends contractRoles$schematype {}

export interface courseRoleSchema extends courseRole$schematype {}

export interface courseTakenSchema extends courseTaken$schematype {}

export interface courseTaughtSchema extends courseTaught$schematype {}

export interface courseTeachingAssistantSchema extends courseTeachingAssistant$schematype {}

export interface creativeSchema extends creative$schematype {}

export interface domainAdvertisingSchema extends domainAdvertising$schematype {}

export interface domainAerospaceSchema extends domainAerospace$schematype {}

export interface domainAgritechSchema extends domainAgritech$schematype {}

export interface domainAutomotiveSchema extends domainAutomotive$schematype {}

export interface domainAutonomousVehiclesSchema extends domainAutonomousVehicles$schematype {}

export interface domainBankingSchema extends domainBanking$schematype {}

export interface domainClimateTechSchema extends domainClimateTech$schematype {}

export interface domainClinicalResearchSchema extends domainClinicalResearch$schematype {}

export interface domainComplianceSchema extends domainCompliance$schematype {}

export interface domainCybersecuritySchema extends domainCybersecurity$schematype {}

export interface domainDataScienceSchema extends domainDataScience$schematype {}

export interface domainDefenseSchema extends domainDefense$schematype {}

export interface domainDevopsSchema extends domainDevops$schematype {}

export interface domainDevrelSchema extends domainDevrel$schematype {}

export interface domainEcommerceSchema extends domainEcommerce$schematype {}

export interface domainEdtechSchema extends domainEdtech$schematype {}

export interface domainExtractionSchema extends domainExtraction$schematype {}

export interface domainFashionDesignSchema extends domainFashionDesign$schematype {}

export interface domainFilmVideoSchema extends domainFilmVideo$schematype {}

export interface domainFintechSchema extends domainFintech$schematype {}

export interface domainFoodBeverageSchema extends domainFoodBeverage$schematype {}

export interface domainFoodTechSchema extends domainFoodTech$schematype {}

export interface domainGameDevSchema extends domainGameDev$schematype {}

export interface domainGamingSchema extends domainGaming$schematype {}

export interface domainGeologicalSchema extends domainGeological$schematype {}

export interface domainHardwareSchema extends domainHardware$schematype {}

export interface domainHealthtechSchema extends domainHealthtech$schematype {}

export interface domainHigherEdSchema extends domainHigherEd$schematype {}

export interface domainHotelsSchema extends domainHotels$schematype {}

export interface domainHrRecruitmentSchema extends domainHrRecruitment$schematype {}

export interface domainHumanRightsSchema extends domainHumanRights$schematype {}

export interface domainInsuranceSchema extends domainInsurance$schematype {}

export interface domainInvestmentMgmtSchema extends domainInvestmentMgmt$schematype {}

export interface domainIpLawSchema extends domainIpLaw$schematype {}

export interface domainJournalismSchema extends domainJournalism$schematype {}

export interface domainLogisticsSchema extends domainLogistics$schematype {}

export interface domainManagementConsultingSchema extends domainManagementConsulting$schematype {}

export interface domainMobileServicesSchema extends domainMobileServices$schematype {}

export interface domainNavalArchitectureSchema extends domainNavalArchitecture$schematype {}

export interface domainNetworkInfraSchema extends domainNetworkInfra$schematype {}

export interface domainOilGasSchema extends domainOilGas$schematype {}

export interface domainOpenSourceSchema extends domainOpenSource$schematype {}

export interface domainPharmaSchema extends domainPharma$schematype {}

export interface domainPortOperationsSchema extends domainPortOperations$schematype {}

export interface domainPrimarySecondarySchema extends domainPrimarySecondary$schematype {}

export interface domainProductDesignSchema extends domainProductDesign$schematype {}

export interface domainProptechSchema extends domainProptech$schematype {}

export interface domainPublicPolicySchema extends domainPublicPolicy$schematype {}

export interface domainRenewablesSchema extends domainRenewables$schematype {}

export interface domainShippingSchema extends domainShipping$schematype {}

export interface domainSoftwareEngineeringSchema extends domainSoftwareEngineering$schematype {}

export interface domainSupplyChainSchema extends domainSupplyChain$schematype {}

export interface domainTextileManufacturingSchema extends domainTextileManufacturing$schematype {}

export interface domainTravelTourismSchema extends domainTravelTourism$schematype {}

export interface domainTypeSchema extends domainType$schematype {}

export interface elementarySchema extends elementary$schematype {}

export interface employmentCurrentSchema extends employmentCurrent$schematype {}

export interface employmentPastSchema extends employmentPast$schematype {}

export interface employmentStatusSchema extends employmentStatus$schematype {}

export interface employmentTypeSchema extends employmentType$schematype {}

export interface externalPlatformSchema extends externalPlatform$schematype {}

export interface externalRecordRefSchema extends externalRecordRef$schematype {}

export interface fellowshipSchema extends fellowship$schematype {}

export interface freelanceSchema extends freelance$schematype {}

export interface fullProfessionalSchema extends fullProfessional$schematype {}

export interface fullTimeSchema extends fullTime$schematype {}

export interface fullTimeRolesSchema extends fullTimeRoles$schematype {}

export interface honorAwardSchema extends honorAward$schematype {}

export interface honorChampionshipSchema extends honorChampionship$schematype {}

export interface honorNominationSchema extends honorNomination$schematype {}

export interface honorRecognitionSchema extends honorRecognition$schematype {}

export interface honorRecordSchema extends honorRecord$schematype {}

export interface hostSchema extends host$schematype {}

export interface hybridSchema extends hybrid$schematype {}

export interface independentWorkSchema extends independentWork$schematype {}

export interface industrySchema extends industry$schematype {}

export interface industryAgricultureSchema extends industryAgriculture$schematype {}

export interface industryConsultingSchema extends industryConsulting$schematype {}

export interface industryDomainSchema extends industryDomain$schematype {}

export interface industryEducationSchema extends industryEducation$schematype {}

export interface industryEnergySchema extends industryEnergy$schematype {}

export interface industryFashionSchema extends industryFashion$schematype {}

export interface industryFinanceSchema extends industryFinance$schematype {}

export interface industryGovernmentSchema extends industryGovernment$schematype {}

export interface industryHealthcareSchema extends industryHealthcare$schematype {}

export interface industryHospitalitySchema extends industryHospitality$schematype {}

export interface industryLegalSchema extends industryLegal$schematype {}

export interface industryManufacturingSchema extends industryManufacturing$schematype {}

export interface industryMaritimeSchema extends industryMaritime$schematype {}

export interface industryMediaSchema extends industryMedia$schematype {}

export interface industryMiningSchema extends industryMining$schematype {}

export interface industryNonprofitSchema extends industryNonprofit$schematype {}

export interface industryOtherSchema extends industryOther$schematype {}

export interface industryRealEstateSchema extends industryRealEstate$schematype {}

export interface industryRetailSchema extends industryRetail$schematype {}

export interface industryTechnologySchema extends industryTechnology$schematype {}

export interface industryTelecomSchema extends industryTelecom$schematype {}

export interface industryTransportSchema extends industryTransport$schematype {}

export interface industryTypeSchema extends industryType$schematype {}

export interface internshipSchema extends internship$schematype {}

export interface interpersonalSchema extends interpersonal$schematype {}

export interface investmentActiveSchema extends investmentActive$schematype {}

export interface investmentAmountSchema extends investmentAmount$schematype {}

export interface investmentExitedSchema extends investmentExited$schematype {}

export interface investmentRoleSchema extends investmentRole$schematype {}

export interface investmentStageSchema extends investmentStage$schematype {}

export interface investmentStatusSchema extends investmentStatus$schematype {}

export interface investmentUndisclosedSchema extends investmentUndisclosed$schematype {}

export interface investmentWrittenOffSchema extends investmentWrittenOff$schematype {}

export interface involvementCharitySchema extends involvementCharity$schematype {}

export interface involvementCivicSchema extends involvementCivic$schematype {}

export interface involvementCommunitySchema extends involvementCommunity$schematype {}

export interface involvementKindSchema extends involvementKind$schematype {}

export interface involvementOpenSourceSchema extends involvementOpenSource$schematype {}

export interface involvementOtherSchema extends involvementOther$schematype {}

export interface keynoteSchema extends keynote$schematype {}

export interface languageSchema extends language$schematype {}

export interface limitedPartnerSchema extends limitedPartner$schematype {}

export interface limitedWorkingSchema extends limitedWorking$schematype {}

export interface linkEventSchema extends linkEvent$schematype {}

export interface linkOtherSchema extends linkOther$schematype {}

export interface linkRecordingSchema extends linkRecording$schematype {}

export interface linkRegistrationSchema extends linkRegistration$schematype {}

export interface linkSlidesSchema extends linkSlides$schematype {}

export interface linkWriteupSchema extends linkWriteup$schematype {}

export interface locationBusinessSchema extends locationBusiness$schematype {}

export interface locationPrimarySchema extends locationPrimary$schematype {}

export interface locationTravelSchema extends locationTravel$schematype {}

export interface locationTypeSchema extends locationType$schematype {}

export interface mentoringOthersSchema extends mentoringOthers$schematype {}

export interface nativeSchema extends native$schematype {}

export interface onSiteSchema extends onSite$schematype {}

export interface openToWorkStatusSchema extends openToWorkStatus$schematype {}

export interface otherInvestmentSchema extends otherInvestment$schematype {}

export interface panelistSchema extends panelist$schematype {}

export interface partTimeSchema extends partTime$schematype {}

export interface partTimeRolesSchema extends partTimeRoles$schematype {}

export interface platformCodebergSchema extends platformCodeberg$schematype {}

export interface platformFediverseSchema extends platformFediverse$schematype {}

export interface platformForgejoSchema extends platformForgejo$schematype {}

export interface platformGiteaSchema extends platformGitea$schematype {}

export interface platformGithubSchema extends platformGithub$schematype {}

export interface platformGitlabSchema extends platformGitlab$schematype {}

export interface platformInstagramSchema extends platformInstagram$schematype {}

export interface platformLinkedinSchema extends platformLinkedin$schematype {}

export interface platformOrcidSchema extends platformOrcid$schematype {}

export interface platformOtherSchema extends platformOther$schematype {}

export interface platformRssSchema extends platformRss$schematype {}

export interface platformSubstackSchema extends platformSubstack$schematype {}

export interface platformTwitterSchema extends platformTwitter$schematype {}

export interface platformWebsiteSchema extends platformWebsite$schematype {}

export interface platformYoutubeSchema extends platformYoutube$schematype {}

export interface presentationLinkSchema extends presentationLink$schematype {}

export interface presentationLinkTypeSchema extends presentationLinkType$schematype {}

export interface presentationRoleSchema extends presentationRole$schematype {}

export interface presenterSchema extends presenter$schematype {}

export interface professionalWorkingSchema extends professionalWorking$schematype {}

export interface proficiencySchema extends proficiency$schematype {}

export interface projectActiveSchema extends projectActive$schematype {}

export interface projectArchivedSchema extends projectArchived$schematype {}

export interface projectCompletedSchema extends projectCompleted$schematype {}

export interface projectContributorSchema extends projectContributor$schematype {}

export interface projectCoreSchema extends projectCore$schematype {}

export interface projectMemberSchema extends projectMember$schematype {}

export interface projectMemberRefSchema extends projectMemberRef$schematype {}

export interface projectOwnerSchema extends projectOwner$schematype {}

export interface projectRoleSchema extends projectRole$schematype {}

export interface projectStatusSchema extends projectStatus$schematype {}

export interface relatedIdentifierSchema extends relatedIdentifier$schematype {}

export interface remoteSchema extends remote$schematype {}

export interface remoteGlobalSchema extends remoteGlobal$schematype {}

export interface remoteLocalSchema extends remoteLocal$schematype {}

export interface remoteRegionSchema extends remoteRegion$schematype {}

export interface seasonalSchema extends seasonal$schematype {}

export interface securitySchema extends security$schematype {}

export interface selfEmployedSchema extends selfEmployed$schematype {}

export interface skillCategorySchema extends skillCategory$schematype {}

export interface skillRefSchema extends skillRef$schematype {}

export interface speakingEngagementsSchema extends speakingEngagements$schematype {}

export interface stageGrowthSchema extends stageGrowth$schematype {}

export interface stageOtherSchema extends stageOther$schematype {}

export interface stagePreSeedSchema extends stagePreSeed$schematype {}

export interface stageSecondarySchema extends stageSecondary$schematype {}

export interface stageSeedSchema extends stageSeed$schematype {}

export interface stageSeriesASchema extends stageSeriesA$schematype {}

export interface stageSeriesBSchema extends stageSeriesB$schematype {}

export interface stageSeriesCPlusSchema extends stageSeriesCPlus$schematype {}

export interface syndicateInvestmentSchema extends syndicateInvestment$schematype {}

export interface technicalSchema extends technical$schematype {}

export interface temporarySchema extends temporary$schematype {}

export interface toolRefSchema extends toolRef$schematype {}

export interface traineeSchema extends trainee$schematype {}

export interface verificationMethodSchema extends verificationMethod$schematype {}

export interface verifiedByDirectorySchema extends verifiedByDirectory$schematype {}

export interface verifiedByEmailSchema extends verifiedByEmail$schematype {}

export interface verifiedByOrgSchema extends verifiedByOrg$schematype {}

export interface verifiedByPeerSchema extends verifiedByPeer$schematype {}

export interface volunteerSchema extends volunteer$schematype {}

export interface workplaceTypeSchema extends workplaceType$schematype {}

export interface workshopSchema extends workshop$schematype {}
export const advisorSchema = _advisorSchema as advisorSchema;
export const agentRefSchema = _agentRefSchema as agentRefSchema;
export const angelInvestmentSchema = _angelInvestmentSchema as angelInvestmentSchema;
export const apprenticeshipSchema = _apprenticeshipSchema as apprenticeshipSchema;
export const artifactLinkSchema = _artifactLinkSchema as artifactLinkSchema;
export const attestationDirectorySchema = _attestationDirectorySchema as attestationDirectorySchema;
export const attestationManualSchema = _attestationManualSchema as attestationManualSchema;
export const attestationSourceSchema = _attestationSourceSchema as attestationSourceSchema;
export const authorSchema = _authorSchema as authorSchema;
export const beingMentoredSchema = _beingMentoredSchema as beingMentoredSchema;
export const boardMemberSchema = _boardMemberSchema as boardMemberSchema;
export const boardObserverSchema = _boardObserverSchema as boardObserverSchema;
export const boardPositionsSchema = _boardPositionsSchema as boardPositionsSchema;
export const businessSchema = _businessSchema as businessSchema;
export const coSpeakerSchema = _coSpeakerSchema as coSpeakerSchema;
export const collaborationsSchema = _collaborationsSchema as collaborationsSchema;
export const collaboratorSchema = _collaboratorSchema as collaboratorSchema;
export const colleagueSchema = _colleagueSchema as colleagueSchema;
export const commissionsSchema = _commissionsSchema as commissionsSchema;
export const communitySchema = _communitySchema as communitySchema;
export const confirmationRelationSchema = _confirmationRelationSchema as confirmationRelationSchema;
export const contextPersonalSchema = _contextPersonalSchema as contextPersonalSchema;
export const contextProfessionalSchema = _contextProfessionalSchema as contextProfessionalSchema;
export const contractSchema = _contractSchema as contractSchema;
export const contractRolesSchema = _contractRolesSchema as contractRolesSchema;
export const courseRoleSchema = _courseRoleSchema as courseRoleSchema;
export const courseTakenSchema = _courseTakenSchema as courseTakenSchema;
export const courseTaughtSchema = _courseTaughtSchema as courseTaughtSchema;
export const courseTeachingAssistantSchema = _courseTeachingAssistantSchema as courseTeachingAssistantSchema;
export const creativeSchema = _creativeSchema as creativeSchema;
export const domainAdvertisingSchema = _domainAdvertisingSchema as domainAdvertisingSchema;
export const domainAerospaceSchema = _domainAerospaceSchema as domainAerospaceSchema;
export const domainAgritechSchema = _domainAgritechSchema as domainAgritechSchema;
export const domainAutomotiveSchema = _domainAutomotiveSchema as domainAutomotiveSchema;
export const domainAutonomousVehiclesSchema = _domainAutonomousVehiclesSchema as domainAutonomousVehiclesSchema;
export const domainBankingSchema = _domainBankingSchema as domainBankingSchema;
export const domainClimateTechSchema = _domainClimateTechSchema as domainClimateTechSchema;
export const domainClinicalResearchSchema = _domainClinicalResearchSchema as domainClinicalResearchSchema;
export const domainComplianceSchema = _domainComplianceSchema as domainComplianceSchema;
export const domainCybersecuritySchema = _domainCybersecuritySchema as domainCybersecuritySchema;
export const domainDataScienceSchema = _domainDataScienceSchema as domainDataScienceSchema;
export const domainDefenseSchema = _domainDefenseSchema as domainDefenseSchema;
export const domainDevopsSchema = _domainDevopsSchema as domainDevopsSchema;
export const domainDevrelSchema = _domainDevrelSchema as domainDevrelSchema;
export const domainEcommerceSchema = _domainEcommerceSchema as domainEcommerceSchema;
export const domainEdtechSchema = _domainEdtechSchema as domainEdtechSchema;
export const domainExtractionSchema = _domainExtractionSchema as domainExtractionSchema;
export const domainFashionDesignSchema = _domainFashionDesignSchema as domainFashionDesignSchema;
export const domainFilmVideoSchema = _domainFilmVideoSchema as domainFilmVideoSchema;
export const domainFintechSchema = _domainFintechSchema as domainFintechSchema;
export const domainFoodBeverageSchema = _domainFoodBeverageSchema as domainFoodBeverageSchema;
export const domainFoodTechSchema = _domainFoodTechSchema as domainFoodTechSchema;
export const domainGameDevSchema = _domainGameDevSchema as domainGameDevSchema;
export const domainGamingSchema = _domainGamingSchema as domainGamingSchema;
export const domainGeologicalSchema = _domainGeologicalSchema as domainGeologicalSchema;
export const domainHardwareSchema = _domainHardwareSchema as domainHardwareSchema;
export const domainHealthtechSchema = _domainHealthtechSchema as domainHealthtechSchema;
export const domainHigherEdSchema = _domainHigherEdSchema as domainHigherEdSchema;
export const domainHotelsSchema = _domainHotelsSchema as domainHotelsSchema;
export const domainHrRecruitmentSchema = _domainHrRecruitmentSchema as domainHrRecruitmentSchema;
export const domainHumanRightsSchema = _domainHumanRightsSchema as domainHumanRightsSchema;
export const domainInsuranceSchema = _domainInsuranceSchema as domainInsuranceSchema;
export const domainInvestmentMgmtSchema = _domainInvestmentMgmtSchema as domainInvestmentMgmtSchema;
export const domainIpLawSchema = _domainIpLawSchema as domainIpLawSchema;
export const domainJournalismSchema = _domainJournalismSchema as domainJournalismSchema;
export const domainLogisticsSchema = _domainLogisticsSchema as domainLogisticsSchema;
export const domainManagementConsultingSchema = _domainManagementConsultingSchema as domainManagementConsultingSchema;
export const domainMobileServicesSchema = _domainMobileServicesSchema as domainMobileServicesSchema;
export const domainNavalArchitectureSchema = _domainNavalArchitectureSchema as domainNavalArchitectureSchema;
export const domainNetworkInfraSchema = _domainNetworkInfraSchema as domainNetworkInfraSchema;
export const domainOilGasSchema = _domainOilGasSchema as domainOilGasSchema;
export const domainOpenSourceSchema = _domainOpenSourceSchema as domainOpenSourceSchema;
export const domainPharmaSchema = _domainPharmaSchema as domainPharmaSchema;
export const domainPortOperationsSchema = _domainPortOperationsSchema as domainPortOperationsSchema;
export const domainPrimarySecondarySchema = _domainPrimarySecondarySchema as domainPrimarySecondarySchema;
export const domainProductDesignSchema = _domainProductDesignSchema as domainProductDesignSchema;
export const domainProptechSchema = _domainProptechSchema as domainProptechSchema;
export const domainPublicPolicySchema = _domainPublicPolicySchema as domainPublicPolicySchema;
export const domainRenewablesSchema = _domainRenewablesSchema as domainRenewablesSchema;
export const domainShippingSchema = _domainShippingSchema as domainShippingSchema;
export const domainSoftwareEngineeringSchema = _domainSoftwareEngineeringSchema as domainSoftwareEngineeringSchema;
export const domainSupplyChainSchema = _domainSupplyChainSchema as domainSupplyChainSchema;
export const domainTextileManufacturingSchema = _domainTextileManufacturingSchema as domainTextileManufacturingSchema;
export const domainTravelTourismSchema = _domainTravelTourismSchema as domainTravelTourismSchema;
export const domainTypeSchema = _domainTypeSchema as domainTypeSchema;
export const elementarySchema = _elementarySchema as elementarySchema;
export const employmentCurrentSchema = _employmentCurrentSchema as employmentCurrentSchema;
export const employmentPastSchema = _employmentPastSchema as employmentPastSchema;
export const employmentStatusSchema = _employmentStatusSchema as employmentStatusSchema;
export const employmentTypeSchema = _employmentTypeSchema as employmentTypeSchema;
export const externalPlatformSchema = _externalPlatformSchema as externalPlatformSchema;
export const externalRecordRefSchema = _externalRecordRefSchema as externalRecordRefSchema;
export const fellowshipSchema = _fellowshipSchema as fellowshipSchema;
export const freelanceSchema = _freelanceSchema as freelanceSchema;
export const fullProfessionalSchema = _fullProfessionalSchema as fullProfessionalSchema;
export const fullTimeSchema = _fullTimeSchema as fullTimeSchema;
export const fullTimeRolesSchema = _fullTimeRolesSchema as fullTimeRolesSchema;
export const honorAwardSchema = _honorAwardSchema as honorAwardSchema;
export const honorChampionshipSchema = _honorChampionshipSchema as honorChampionshipSchema;
export const honorNominationSchema = _honorNominationSchema as honorNominationSchema;
export const honorRecognitionSchema = _honorRecognitionSchema as honorRecognitionSchema;
export const honorRecordSchema = _honorRecordSchema as honorRecordSchema;
export const hostSchema = _hostSchema as hostSchema;
export const hybridSchema = _hybridSchema as hybridSchema;
export const independentWorkSchema = _independentWorkSchema as independentWorkSchema;
export const industrySchema = _industrySchema as industrySchema;
export const industryAgricultureSchema = _industryAgricultureSchema as industryAgricultureSchema;
export const industryConsultingSchema = _industryConsultingSchema as industryConsultingSchema;
export const industryDomainSchema = _industryDomainSchema as industryDomainSchema;
export const industryEducationSchema = _industryEducationSchema as industryEducationSchema;
export const industryEnergySchema = _industryEnergySchema as industryEnergySchema;
export const industryFashionSchema = _industryFashionSchema as industryFashionSchema;
export const industryFinanceSchema = _industryFinanceSchema as industryFinanceSchema;
export const industryGovernmentSchema = _industryGovernmentSchema as industryGovernmentSchema;
export const industryHealthcareSchema = _industryHealthcareSchema as industryHealthcareSchema;
export const industryHospitalitySchema = _industryHospitalitySchema as industryHospitalitySchema;
export const industryLegalSchema = _industryLegalSchema as industryLegalSchema;
export const industryManufacturingSchema = _industryManufacturingSchema as industryManufacturingSchema;
export const industryMaritimeSchema = _industryMaritimeSchema as industryMaritimeSchema;
export const industryMediaSchema = _industryMediaSchema as industryMediaSchema;
export const industryMiningSchema = _industryMiningSchema as industryMiningSchema;
export const industryNonprofitSchema = _industryNonprofitSchema as industryNonprofitSchema;
export const industryOtherSchema = _industryOtherSchema as industryOtherSchema;
export const industryRealEstateSchema = _industryRealEstateSchema as industryRealEstateSchema;
export const industryRetailSchema = _industryRetailSchema as industryRetailSchema;
export const industryTechnologySchema = _industryTechnologySchema as industryTechnologySchema;
export const industryTelecomSchema = _industryTelecomSchema as industryTelecomSchema;
export const industryTransportSchema = _industryTransportSchema as industryTransportSchema;
export const industryTypeSchema = _industryTypeSchema as industryTypeSchema;
export const internshipSchema = _internshipSchema as internshipSchema;
export const interpersonalSchema = _interpersonalSchema as interpersonalSchema;
export const investmentActiveSchema = _investmentActiveSchema as investmentActiveSchema;
export const investmentAmountSchema = _investmentAmountSchema as investmentAmountSchema;
export const investmentExitedSchema = _investmentExitedSchema as investmentExitedSchema;
export const investmentRoleSchema = _investmentRoleSchema as investmentRoleSchema;
export const investmentStageSchema = _investmentStageSchema as investmentStageSchema;
export const investmentStatusSchema = _investmentStatusSchema as investmentStatusSchema;
export const investmentUndisclosedSchema = _investmentUndisclosedSchema as investmentUndisclosedSchema;
export const investmentWrittenOffSchema = _investmentWrittenOffSchema as investmentWrittenOffSchema;
export const involvementCharitySchema = _involvementCharitySchema as involvementCharitySchema;
export const involvementCivicSchema = _involvementCivicSchema as involvementCivicSchema;
export const involvementCommunitySchema = _involvementCommunitySchema as involvementCommunitySchema;
export const involvementKindSchema = _involvementKindSchema as involvementKindSchema;
export const involvementOpenSourceSchema = _involvementOpenSourceSchema as involvementOpenSourceSchema;
export const involvementOtherSchema = _involvementOtherSchema as involvementOtherSchema;
export const keynoteSchema = _keynoteSchema as keynoteSchema;
export const languageSchema = _languageSchema as languageSchema;
export const limitedPartnerSchema = _limitedPartnerSchema as limitedPartnerSchema;
export const limitedWorkingSchema = _limitedWorkingSchema as limitedWorkingSchema;
export const linkEventSchema = _linkEventSchema as linkEventSchema;
export const linkOtherSchema = _linkOtherSchema as linkOtherSchema;
export const linkRecordingSchema = _linkRecordingSchema as linkRecordingSchema;
export const linkRegistrationSchema = _linkRegistrationSchema as linkRegistrationSchema;
export const linkSlidesSchema = _linkSlidesSchema as linkSlidesSchema;
export const linkWriteupSchema = _linkWriteupSchema as linkWriteupSchema;
export const locationBusinessSchema = _locationBusinessSchema as locationBusinessSchema;
export const locationPrimarySchema = _locationPrimarySchema as locationPrimarySchema;
export const locationTravelSchema = _locationTravelSchema as locationTravelSchema;
export const locationTypeSchema = _locationTypeSchema as locationTypeSchema;
export const mentoringOthersSchema = _mentoringOthersSchema as mentoringOthersSchema;
export const nativeSchema = _nativeSchema as nativeSchema;
export const onSiteSchema = _onSiteSchema as onSiteSchema;
export const openToWorkStatusSchema = _openToWorkStatusSchema as openToWorkStatusSchema;
export const otherInvestmentSchema = _otherInvestmentSchema as otherInvestmentSchema;
export const panelistSchema = _panelistSchema as panelistSchema;
export const partTimeSchema = _partTimeSchema as partTimeSchema;
export const partTimeRolesSchema = _partTimeRolesSchema as partTimeRolesSchema;
export const platformCodebergSchema = _platformCodebergSchema as platformCodebergSchema;
export const platformFediverseSchema = _platformFediverseSchema as platformFediverseSchema;
export const platformForgejoSchema = _platformForgejoSchema as platformForgejoSchema;
export const platformGiteaSchema = _platformGiteaSchema as platformGiteaSchema;
export const platformGithubSchema = _platformGithubSchema as platformGithubSchema;
export const platformGitlabSchema = _platformGitlabSchema as platformGitlabSchema;
export const platformInstagramSchema = _platformInstagramSchema as platformInstagramSchema;
export const platformLinkedinSchema = _platformLinkedinSchema as platformLinkedinSchema;
export const platformOrcidSchema = _platformOrcidSchema as platformOrcidSchema;
export const platformOtherSchema = _platformOtherSchema as platformOtherSchema;
export const platformRssSchema = _platformRssSchema as platformRssSchema;
export const platformSubstackSchema = _platformSubstackSchema as platformSubstackSchema;
export const platformTwitterSchema = _platformTwitterSchema as platformTwitterSchema;
export const platformWebsiteSchema = _platformWebsiteSchema as platformWebsiteSchema;
export const platformYoutubeSchema = _platformYoutubeSchema as platformYoutubeSchema;
export const presentationLinkSchema = _presentationLinkSchema as presentationLinkSchema;
export const presentationLinkTypeSchema = _presentationLinkTypeSchema as presentationLinkTypeSchema;
export const presentationRoleSchema = _presentationRoleSchema as presentationRoleSchema;
export const presenterSchema = _presenterSchema as presenterSchema;
export const professionalWorkingSchema = _professionalWorkingSchema as professionalWorkingSchema;
export const proficiencySchema = _proficiencySchema as proficiencySchema;
export const projectActiveSchema = _projectActiveSchema as projectActiveSchema;
export const projectArchivedSchema = _projectArchivedSchema as projectArchivedSchema;
export const projectCompletedSchema = _projectCompletedSchema as projectCompletedSchema;
export const projectContributorSchema = _projectContributorSchema as projectContributorSchema;
export const projectCoreSchema = _projectCoreSchema as projectCoreSchema;
export const projectMemberSchema = _projectMemberSchema as projectMemberSchema;
export const projectMemberRefSchema = _projectMemberRefSchema as projectMemberRefSchema;
export const projectOwnerSchema = _projectOwnerSchema as projectOwnerSchema;
export const projectRoleSchema = _projectRoleSchema as projectRoleSchema;
export const projectStatusSchema = _projectStatusSchema as projectStatusSchema;
export const relatedIdentifierSchema = _relatedIdentifierSchema as relatedIdentifierSchema;
export const remoteSchema = _remoteSchema as remoteSchema;
export const remoteGlobalSchema = _remoteGlobalSchema as remoteGlobalSchema;
export const remoteLocalSchema = _remoteLocalSchema as remoteLocalSchema;
export const remoteRegionSchema = _remoteRegionSchema as remoteRegionSchema;
export const seasonalSchema = _seasonalSchema as seasonalSchema;
export const securitySchema = _securitySchema as securitySchema;
export const selfEmployedSchema = _selfEmployedSchema as selfEmployedSchema;
export const skillCategorySchema = _skillCategorySchema as skillCategorySchema;
export const skillRefSchema = _skillRefSchema as skillRefSchema;
export const speakingEngagementsSchema = _speakingEngagementsSchema as speakingEngagementsSchema;
export const stageGrowthSchema = _stageGrowthSchema as stageGrowthSchema;
export const stageOtherSchema = _stageOtherSchema as stageOtherSchema;
export const stagePreSeedSchema = _stagePreSeedSchema as stagePreSeedSchema;
export const stageSecondarySchema = _stageSecondarySchema as stageSecondarySchema;
export const stageSeedSchema = _stageSeedSchema as stageSeedSchema;
export const stageSeriesASchema = _stageSeriesASchema as stageSeriesASchema;
export const stageSeriesBSchema = _stageSeriesBSchema as stageSeriesBSchema;
export const stageSeriesCPlusSchema = _stageSeriesCPlusSchema as stageSeriesCPlusSchema;
export const syndicateInvestmentSchema = _syndicateInvestmentSchema as syndicateInvestmentSchema;
export const technicalSchema = _technicalSchema as technicalSchema;
export const temporarySchema = _temporarySchema as temporarySchema;
export const toolRefSchema = _toolRefSchema as toolRefSchema;
export const traineeSchema = _traineeSchema as traineeSchema;
export const verificationMethodSchema = _verificationMethodSchema as verificationMethodSchema;
export const verifiedByDirectorySchema = _verifiedByDirectorySchema as verifiedByDirectorySchema;
export const verifiedByEmailSchema = _verifiedByEmailSchema as verifiedByEmailSchema;
export const verifiedByOrgSchema = _verifiedByOrgSchema as verifiedByOrgSchema;
export const verifiedByPeerSchema = _verifiedByPeerSchema as verifiedByPeerSchema;
export const volunteerSchema = _volunteerSchema as volunteerSchema;
export const workplaceTypeSchema = _workplaceTypeSchema as workplaceTypeSchema;
export const workshopSchema = _workshopSchema as workshopSchema;
export type Advisor = v.InferInput<typeof advisorSchema>;

export interface AgentRef extends v.InferInput<typeof agentRefSchema> {}
export type AngelInvestment = v.InferInput<typeof angelInvestmentSchema>;
export type Apprenticeship = v.InferInput<typeof apprenticeshipSchema>;

export interface ArtifactLink extends v.InferInput<typeof artifactLinkSchema> {}
export type AttestationDirectory = v.InferInput<typeof attestationDirectorySchema>;
export type AttestationManual = v.InferInput<typeof attestationManualSchema>;
export type AttestationSource = v.InferInput<typeof attestationSourceSchema>;
export type Author = v.InferInput<typeof authorSchema>;
export type BeingMentored = v.InferInput<typeof beingMentoredSchema>;
export type BoardMember = v.InferInput<typeof boardMemberSchema>;
export type BoardObserver = v.InferInput<typeof boardObserverSchema>;
export type BoardPositions = v.InferInput<typeof boardPositionsSchema>;
export type Business = v.InferInput<typeof businessSchema>;
export type CoSpeaker = v.InferInput<typeof coSpeakerSchema>;
export type Collaborations = v.InferInput<typeof collaborationsSchema>;
export type Collaborator = v.InferInput<typeof collaboratorSchema>;
export type Colleague = v.InferInput<typeof colleagueSchema>;
export type Commissions = v.InferInput<typeof commissionsSchema>;
export type Community = v.InferInput<typeof communitySchema>;
export type ConfirmationRelation = v.InferInput<typeof confirmationRelationSchema>;
export type ContextPersonal = v.InferInput<typeof contextPersonalSchema>;
export type ContextProfessional = v.InferInput<typeof contextProfessionalSchema>;
export type Contract = v.InferInput<typeof contractSchema>;
export type ContractRoles = v.InferInput<typeof contractRolesSchema>;
export type CourseRole = v.InferInput<typeof courseRoleSchema>;
export type CourseTaken = v.InferInput<typeof courseTakenSchema>;
export type CourseTaught = v.InferInput<typeof courseTaughtSchema>;
export type CourseTeachingAssistant = v.InferInput<typeof courseTeachingAssistantSchema>;
export type Creative = v.InferInput<typeof creativeSchema>;
export type DomainAdvertising = v.InferInput<typeof domainAdvertisingSchema>;
export type DomainAerospace = v.InferInput<typeof domainAerospaceSchema>;
export type DomainAgritech = v.InferInput<typeof domainAgritechSchema>;
export type DomainAutomotive = v.InferInput<typeof domainAutomotiveSchema>;
export type DomainAutonomousVehicles = v.InferInput<typeof domainAutonomousVehiclesSchema>;
export type DomainBanking = v.InferInput<typeof domainBankingSchema>;
export type DomainClimateTech = v.InferInput<typeof domainClimateTechSchema>;
export type DomainClinicalResearch = v.InferInput<typeof domainClinicalResearchSchema>;
export type DomainCompliance = v.InferInput<typeof domainComplianceSchema>;
export type DomainCybersecurity = v.InferInput<typeof domainCybersecuritySchema>;
export type DomainDataScience = v.InferInput<typeof domainDataScienceSchema>;
export type DomainDefense = v.InferInput<typeof domainDefenseSchema>;
export type DomainDevops = v.InferInput<typeof domainDevopsSchema>;
export type DomainDevrel = v.InferInput<typeof domainDevrelSchema>;
export type DomainEcommerce = v.InferInput<typeof domainEcommerceSchema>;
export type DomainEdtech = v.InferInput<typeof domainEdtechSchema>;
export type DomainExtraction = v.InferInput<typeof domainExtractionSchema>;
export type DomainFashionDesign = v.InferInput<typeof domainFashionDesignSchema>;
export type DomainFilmVideo = v.InferInput<typeof domainFilmVideoSchema>;
export type DomainFintech = v.InferInput<typeof domainFintechSchema>;
export type DomainFoodBeverage = v.InferInput<typeof domainFoodBeverageSchema>;
export type DomainFoodTech = v.InferInput<typeof domainFoodTechSchema>;
export type DomainGameDev = v.InferInput<typeof domainGameDevSchema>;
export type DomainGaming = v.InferInput<typeof domainGamingSchema>;
export type DomainGeological = v.InferInput<typeof domainGeologicalSchema>;
export type DomainHardware = v.InferInput<typeof domainHardwareSchema>;
export type DomainHealthtech = v.InferInput<typeof domainHealthtechSchema>;
export type DomainHigherEd = v.InferInput<typeof domainHigherEdSchema>;
export type DomainHotels = v.InferInput<typeof domainHotelsSchema>;
export type DomainHrRecruitment = v.InferInput<typeof domainHrRecruitmentSchema>;
export type DomainHumanRights = v.InferInput<typeof domainHumanRightsSchema>;
export type DomainInsurance = v.InferInput<typeof domainInsuranceSchema>;
export type DomainInvestmentMgmt = v.InferInput<typeof domainInvestmentMgmtSchema>;
export type DomainIpLaw = v.InferInput<typeof domainIpLawSchema>;
export type DomainJournalism = v.InferInput<typeof domainJournalismSchema>;
export type DomainLogistics = v.InferInput<typeof domainLogisticsSchema>;
export type DomainManagementConsulting = v.InferInput<typeof domainManagementConsultingSchema>;
export type DomainMobileServices = v.InferInput<typeof domainMobileServicesSchema>;
export type DomainNavalArchitecture = v.InferInput<typeof domainNavalArchitectureSchema>;
export type DomainNetworkInfra = v.InferInput<typeof domainNetworkInfraSchema>;
export type DomainOilGas = v.InferInput<typeof domainOilGasSchema>;
export type DomainOpenSource = v.InferInput<typeof domainOpenSourceSchema>;
export type DomainPharma = v.InferInput<typeof domainPharmaSchema>;
export type DomainPortOperations = v.InferInput<typeof domainPortOperationsSchema>;
export type DomainPrimarySecondary = v.InferInput<typeof domainPrimarySecondarySchema>;
export type DomainProductDesign = v.InferInput<typeof domainProductDesignSchema>;
export type DomainProptech = v.InferInput<typeof domainProptechSchema>;
export type DomainPublicPolicy = v.InferInput<typeof domainPublicPolicySchema>;
export type DomainRenewables = v.InferInput<typeof domainRenewablesSchema>;
export type DomainShipping = v.InferInput<typeof domainShippingSchema>;
export type DomainSoftwareEngineering = v.InferInput<typeof domainSoftwareEngineeringSchema>;
export type DomainSupplyChain = v.InferInput<typeof domainSupplyChainSchema>;
export type DomainTextileManufacturing = v.InferInput<typeof domainTextileManufacturingSchema>;
export type DomainTravelTourism = v.InferInput<typeof domainTravelTourismSchema>;
export type DomainType = v.InferInput<typeof domainTypeSchema>;
export type Elementary = v.InferInput<typeof elementarySchema>;
export type EmploymentCurrent = v.InferInput<typeof employmentCurrentSchema>;
export type EmploymentPast = v.InferInput<typeof employmentPastSchema>;
export type EmploymentStatus = v.InferInput<typeof employmentStatusSchema>;
export type EmploymentType = v.InferInput<typeof employmentTypeSchema>;
export type ExternalPlatform = v.InferInput<typeof externalPlatformSchema>;

export interface ExternalRecordRef extends v.InferInput<typeof externalRecordRefSchema> {}
export type Fellowship = v.InferInput<typeof fellowshipSchema>;
export type Freelance = v.InferInput<typeof freelanceSchema>;
export type FullProfessional = v.InferInput<typeof fullProfessionalSchema>;
export type FullTime = v.InferInput<typeof fullTimeSchema>;
export type FullTimeRoles = v.InferInput<typeof fullTimeRolesSchema>;
export type HonorAward = v.InferInput<typeof honorAwardSchema>;
export type HonorChampionship = v.InferInput<typeof honorChampionshipSchema>;
export type HonorNomination = v.InferInput<typeof honorNominationSchema>;
export type HonorRecognition = v.InferInput<typeof honorRecognitionSchema>;
export type HonorRecord = v.InferInput<typeof honorRecordSchema>;
export type Host = v.InferInput<typeof hostSchema>;
export type Hybrid = v.InferInput<typeof hybridSchema>;
export type IndependentWork = v.InferInput<typeof independentWorkSchema>;
export type Industry = v.InferInput<typeof industrySchema>;
export type IndustryAgriculture = v.InferInput<typeof industryAgricultureSchema>;
export type IndustryConsulting = v.InferInput<typeof industryConsultingSchema>;

export interface IndustryDomain extends v.InferInput<typeof industryDomainSchema> {}
export type IndustryEducation = v.InferInput<typeof industryEducationSchema>;
export type IndustryEnergy = v.InferInput<typeof industryEnergySchema>;
export type IndustryFashion = v.InferInput<typeof industryFashionSchema>;
export type IndustryFinance = v.InferInput<typeof industryFinanceSchema>;
export type IndustryGovernment = v.InferInput<typeof industryGovernmentSchema>;
export type IndustryHealthcare = v.InferInput<typeof industryHealthcareSchema>;
export type IndustryHospitality = v.InferInput<typeof industryHospitalitySchema>;
export type IndustryLegal = v.InferInput<typeof industryLegalSchema>;
export type IndustryManufacturing = v.InferInput<typeof industryManufacturingSchema>;
export type IndustryMaritime = v.InferInput<typeof industryMaritimeSchema>;
export type IndustryMedia = v.InferInput<typeof industryMediaSchema>;
export type IndustryMining = v.InferInput<typeof industryMiningSchema>;
export type IndustryNonprofit = v.InferInput<typeof industryNonprofitSchema>;
export type IndustryOther = v.InferInput<typeof industryOtherSchema>;
export type IndustryRealEstate = v.InferInput<typeof industryRealEstateSchema>;
export type IndustryRetail = v.InferInput<typeof industryRetailSchema>;
export type IndustryTechnology = v.InferInput<typeof industryTechnologySchema>;
export type IndustryTelecom = v.InferInput<typeof industryTelecomSchema>;
export type IndustryTransport = v.InferInput<typeof industryTransportSchema>;
export type IndustryType = v.InferInput<typeof industryTypeSchema>;
export type Internship = v.InferInput<typeof internshipSchema>;
export type Interpersonal = v.InferInput<typeof interpersonalSchema>;
export type InvestmentActive = v.InferInput<typeof investmentActiveSchema>;

export interface InvestmentAmount extends v.InferInput<typeof investmentAmountSchema> {}
export type InvestmentExited = v.InferInput<typeof investmentExitedSchema>;
export type InvestmentRole = v.InferInput<typeof investmentRoleSchema>;
export type InvestmentStage = v.InferInput<typeof investmentStageSchema>;
export type InvestmentStatus = v.InferInput<typeof investmentStatusSchema>;
export type InvestmentUndisclosed = v.InferInput<typeof investmentUndisclosedSchema>;
export type InvestmentWrittenOff = v.InferInput<typeof investmentWrittenOffSchema>;
export type InvolvementCharity = v.InferInput<typeof involvementCharitySchema>;
export type InvolvementCivic = v.InferInput<typeof involvementCivicSchema>;
export type InvolvementCommunity = v.InferInput<typeof involvementCommunitySchema>;
export type InvolvementKind = v.InferInput<typeof involvementKindSchema>;
export type InvolvementOpenSource = v.InferInput<typeof involvementOpenSourceSchema>;
export type InvolvementOther = v.InferInput<typeof involvementOtherSchema>;
export type Keynote = v.InferInput<typeof keynoteSchema>;
export type Language = v.InferInput<typeof languageSchema>;
export type LimitedPartner = v.InferInput<typeof limitedPartnerSchema>;
export type LimitedWorking = v.InferInput<typeof limitedWorkingSchema>;
export type LinkEvent = v.InferInput<typeof linkEventSchema>;
export type LinkOther = v.InferInput<typeof linkOtherSchema>;
export type LinkRecording = v.InferInput<typeof linkRecordingSchema>;
export type LinkRegistration = v.InferInput<typeof linkRegistrationSchema>;
export type LinkSlides = v.InferInput<typeof linkSlidesSchema>;
export type LinkWriteup = v.InferInput<typeof linkWriteupSchema>;
export type LocationBusiness = v.InferInput<typeof locationBusinessSchema>;
export type LocationPrimary = v.InferInput<typeof locationPrimarySchema>;
export type LocationTravel = v.InferInput<typeof locationTravelSchema>;
export type LocationType = v.InferInput<typeof locationTypeSchema>;
export type MentoringOthers = v.InferInput<typeof mentoringOthersSchema>;
export type Native = v.InferInput<typeof nativeSchema>;
export type OnSite = v.InferInput<typeof onSiteSchema>;
export type OpenToWorkStatus = v.InferInput<typeof openToWorkStatusSchema>;
export type OtherInvestment = v.InferInput<typeof otherInvestmentSchema>;
export type Panelist = v.InferInput<typeof panelistSchema>;
export type PartTime = v.InferInput<typeof partTimeSchema>;
export type PartTimeRoles = v.InferInput<typeof partTimeRolesSchema>;
export type PlatformCodeberg = v.InferInput<typeof platformCodebergSchema>;
export type PlatformFediverse = v.InferInput<typeof platformFediverseSchema>;
export type PlatformForgejo = v.InferInput<typeof platformForgejoSchema>;
export type PlatformGitea = v.InferInput<typeof platformGiteaSchema>;
export type PlatformGithub = v.InferInput<typeof platformGithubSchema>;
export type PlatformGitlab = v.InferInput<typeof platformGitlabSchema>;
export type PlatformInstagram = v.InferInput<typeof platformInstagramSchema>;
export type PlatformLinkedin = v.InferInput<typeof platformLinkedinSchema>;
export type PlatformOrcid = v.InferInput<typeof platformOrcidSchema>;
export type PlatformOther = v.InferInput<typeof platformOtherSchema>;
export type PlatformRss = v.InferInput<typeof platformRssSchema>;
export type PlatformSubstack = v.InferInput<typeof platformSubstackSchema>;
export type PlatformTwitter = v.InferInput<typeof platformTwitterSchema>;
export type PlatformWebsite = v.InferInput<typeof platformWebsiteSchema>;
export type PlatformYoutube = v.InferInput<typeof platformYoutubeSchema>;

export interface PresentationLink extends v.InferInput<typeof presentationLinkSchema> {}
export type PresentationLinkType = v.InferInput<typeof presentationLinkTypeSchema>;
export type PresentationRole = v.InferInput<typeof presentationRoleSchema>;
export type Presenter = v.InferInput<typeof presenterSchema>;
export type ProfessionalWorking = v.InferInput<typeof professionalWorkingSchema>;
export type Proficiency = v.InferInput<typeof proficiencySchema>;
export type ProjectActive = v.InferInput<typeof projectActiveSchema>;
export type ProjectArchived = v.InferInput<typeof projectArchivedSchema>;
export type ProjectCompleted = v.InferInput<typeof projectCompletedSchema>;
export type ProjectContributor = v.InferInput<typeof projectContributorSchema>;
export type ProjectCore = v.InferInput<typeof projectCoreSchema>;
export type ProjectMember = v.InferInput<typeof projectMemberSchema>;

export interface ProjectMemberRef extends v.InferInput<typeof projectMemberRefSchema> {}
export type ProjectOwner = v.InferInput<typeof projectOwnerSchema>;
export type ProjectRole = v.InferInput<typeof projectRoleSchema>;
export type ProjectStatus = v.InferInput<typeof projectStatusSchema>;

export interface RelatedIdentifier extends v.InferInput<typeof relatedIdentifierSchema> {}
export type Remote = v.InferInput<typeof remoteSchema>;
export type RemoteGlobal = v.InferInput<typeof remoteGlobalSchema>;
export type RemoteLocal = v.InferInput<typeof remoteLocalSchema>;
export type RemoteRegion = v.InferInput<typeof remoteRegionSchema>;
export type Seasonal = v.InferInput<typeof seasonalSchema>;
export type Security = v.InferInput<typeof securitySchema>;
export type SelfEmployed = v.InferInput<typeof selfEmployedSchema>;
export type SkillCategory = v.InferInput<typeof skillCategorySchema>;

export interface SkillRef extends v.InferInput<typeof skillRefSchema> {}
export type SpeakingEngagements = v.InferInput<typeof speakingEngagementsSchema>;
export type StageGrowth = v.InferInput<typeof stageGrowthSchema>;
export type StageOther = v.InferInput<typeof stageOtherSchema>;
export type StagePreSeed = v.InferInput<typeof stagePreSeedSchema>;
export type StageSecondary = v.InferInput<typeof stageSecondarySchema>;
export type StageSeed = v.InferInput<typeof stageSeedSchema>;
export type StageSeriesA = v.InferInput<typeof stageSeriesASchema>;
export type StageSeriesB = v.InferInput<typeof stageSeriesBSchema>;
export type StageSeriesCPlus = v.InferInput<typeof stageSeriesCPlusSchema>;
export type SyndicateInvestment = v.InferInput<typeof syndicateInvestmentSchema>;
export type Technical = v.InferInput<typeof technicalSchema>;
export type Temporary = v.InferInput<typeof temporarySchema>;

export interface ToolRef extends v.InferInput<typeof toolRefSchema> {}
export type Trainee = v.InferInput<typeof traineeSchema>;
export type VerificationMethod = v.InferInput<typeof verificationMethodSchema>;
export type VerifiedByDirectory = v.InferInput<typeof verifiedByDirectorySchema>;
export type VerifiedByEmail = v.InferInput<typeof verifiedByEmailSchema>;
export type VerifiedByOrg = v.InferInput<typeof verifiedByOrgSchema>;
export type VerifiedByPeer = v.InferInput<typeof verifiedByPeerSchema>;
export type Volunteer = v.InferInput<typeof volunteerSchema>;
export type WorkplaceType = v.InferInput<typeof workplaceTypeSchema>;
export type Workshop = v.InferInput<typeof workshopSchema>;
