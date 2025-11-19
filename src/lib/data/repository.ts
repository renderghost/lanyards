/**
 * Repository pattern for managing profile data in PDS
 * This provides an abstraction layer for CRUD operations on AT Protocol records
 */

import { AtpAgent } from '@atproto/api';
import { TID } from '@atproto/common';
import type {
  Identity,
  Honorific,
  Affiliation,
  Qualification,
  Skill,
  ProfileContent,
  ProfilePinned,
  ProfileTheme,
  ProfileVisible,
  Collection,
  LinkEvent,
  LinkWork,
  LinkSocial,
  LinkWeb,
  LinkMediaAudio,
  LinkMediaCode,
  LinkMediaVideo,
} from '@/types';

const LEXICON_PREFIX = 'app.lanyards';

export class ProfileRepository {
  constructor(private agent: AtpAgent) {}

  // Identity operations (singleton, key: "self")
  async getIdentity(did: string): Promise<Identity | null> {
    try {
      const response = await this.agent.com.atproto.repo.getRecord({
        repo: did,
        collection: `${LEXICON_PREFIX}.actor.biography.identity`,
        rkey: 'self',
      });
      return response.data.value as unknown as Identity;
    } catch {
      return null;
    }
  }

  async createIdentity(identity: Omit<Identity, 'createdAt'>) {
    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.identity`,
      rkey: 'self',
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.identity`,
        ...identity,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async updateIdentity(updates: Partial<Identity>) {
    const current = await this.getIdentity(this.agent.session?.did || '');
    if (!current) {
      throw new Error('Identity not found');
    }

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.identity`,
      rkey: 'self',
      record: {
        ...current,
        ...updates,
        $type: `${LEXICON_PREFIX}.actor.biography.identity`,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  // Honorific operations (singleton, key: "self")
  async getHonorific(did: string): Promise<Honorific | null> {
    try {
      const response = await this.agent.com.atproto.repo.getRecord({
        repo: did,
        collection: `${LEXICON_PREFIX}.actor.biography.honorific`,
        rkey: 'self',
      });
      return response.data.value as unknown as Honorific;
    } catch {
      return null;
    }
  }

  async setHonorific(honorific: Omit<Honorific, 'createdAt' | 'updatedAt'>) {
    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.honorific`,
      rkey: 'self',
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.honorific`,
        ...honorific,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  // Affiliation operations
  async listAffiliations(
    did: string
  ): Promise<(Affiliation & { rkey: string; uri: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.actor.biography.affiliation`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Affiliation),
      rkey: r.uri.split('/').pop() || '',
      uri: r.uri,
    }));
  }

  async createAffiliation(
    affiliation: Omit<Affiliation, 'createdAt'>
  ): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.affiliation`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.affiliation`,
        ...affiliation,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateAffiliation(rkey: string, updates: Partial<Affiliation>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.affiliation`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.affiliation`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.actor.biography.affiliation`,
      },
    });
  }

  async deleteAffiliation(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.affiliation`,
      rkey,
    });
  }

  // Qualification operations
  async listQualifications(
    did: string
  ): Promise<(Qualification & { rkey: string; uri: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.actor.biography.qualification`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Qualification),
      rkey: r.uri.split('/').pop() || '',
      uri: r.uri,
    }));
  }

  async createQualification(
    qualification: Omit<Qualification, 'createdAt'>
  ): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.qualification`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.qualification`,
        ...qualification,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateQualification(rkey: string, updates: Partial<Qualification>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.qualification`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.qualification`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.actor.biography.qualification`,
      },
    });
  }

  async deleteQualification(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.qualification`,
      rkey,
    });
  }

  // Skill operations
  async listSkills(
    did: string
  ): Promise<(Skill & { rkey: string; uri: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.actor.biography.skill`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Skill),
      rkey: r.uri.split('/').pop() || '',
      uri: r.uri,
    }));
  }

  async createSkill(skill: Omit<Skill, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.skill`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.skill`,
        ...skill,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateSkill(rkey: string, updates: Partial<Skill>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.skill`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.skill`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.actor.biography.skill`,
      },
    });
  }

  async deleteSkill(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.skill`,
      rkey,
    });
  }

  // Link: Event operations
  async listEvents(did: string): Promise<(LinkEvent & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.link.event`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as LinkEvent),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createEvent(event: Omit<LinkEvent, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.event`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.link.event`,
        ...event,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateEvent(rkey: string, updates: Partial<LinkEvent>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.event`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.event`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.link.event`,
      },
    });
  }

  async deleteEvent(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.event`,
      rkey,
    });
  }

  // Link: Work operations
  async listWorks(did: string): Promise<(LinkWork & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.link.work`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as LinkWork),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createWork(work: Omit<LinkWork, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.work`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.link.work`,
        ...work,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateWork(rkey: string, updates: Partial<LinkWork>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.work`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.work`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.link.work`,
      },
    });
  }

  async deleteWork(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.work`,
      rkey,
    });
  }

  // Link: Social operations
  async listSocialLinks(
    did: string
  ): Promise<(LinkSocial & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.link.social`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as LinkSocial),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createSocialLink(
    link: Omit<LinkSocial, 'createdAt'>
  ): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.social`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.link.social`,
        ...link,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateSocialLink(rkey: string, updates: Partial<LinkSocial>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.social`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.social`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.link.social`,
      },
    });
  }

  async deleteSocialLink(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.social`,
      rkey,
    });
  }

  // Link: Web operations
  async listWebLinks(did: string): Promise<(LinkWeb & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.link.web`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as LinkWeb),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createWebLink(link: Omit<LinkWeb, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.web`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.link.web`,
        ...link,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateWebLink(rkey: string, updates: Partial<LinkWeb>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.web`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.web`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.link.web`,
      },
    });
  }

  async deleteWebLink(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link.web`,
      rkey,
    });
  }

  // Location operations (singleton, key: "self")
  async getLocation(did: string) {
    try {
      const response = await this.agent.com.atproto.repo.getRecord({
        repo: did,
        collection: `${LEXICON_PREFIX}.actor.biography.location`,
        rkey: 'self',
      });
      return response.data.value as any;
    } catch {
      return null;
    }
  }

  async setLocation(location: { city?: string; country?: string }) {
    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.actor.biography.location`,
      rkey: 'self',
      record: {
        $type: `${LEXICON_PREFIX}.actor.biography.location`,
        ...location,
        createdAt: new Date().toISOString(),
      },
    });
  }

  // Collection operations
  async listCollections(did: string): Promise<(Collection & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.collection`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Collection),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createCollection(
    collection: Omit<Collection, 'createdAt'>
  ): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.collection`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.collection`,
        ...collection,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateCollection(rkey: string, updates: Partial<Collection>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.collection`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.collection`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.collection`,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async deleteCollection(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.collection`,
      rkey,
    });
  }
}
