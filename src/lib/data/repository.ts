/**
 * Repository pattern for managing profile data in PDS
 * This provides an abstraction layer for CRUD operations on AT Protocol records
 */

import { AtpAgent } from '@atproto/api';
import { TID } from '@atproto/common';
import type {
  Profile,
  Affiliation,
  Link as WebLink,
  Work,
  Event,
} from '@/types';

const LEXICON_PREFIX = 'at.lanyard';

export class ProfileRepository {
  constructor(private agent: AtpAgent) {}

  // Profile operations
  async getProfile(did: string): Promise<Profile | null> {
    try {
      const response = await this.agent.com.atproto.repo.getRecord({
        repo: did,
        collection: `${LEXICON_PREFIX}.profile`,
        rkey: 'self',
      });
      return response.data.value as unknown as Profile;
    } catch {
      return null;
    }
  }

  async createProfile(profile: Omit<Profile, 'createdAt'>) {
    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.profile`,
      rkey: 'self',
      record: {
        $type: `${LEXICON_PREFIX}.profile`,
        ...profile,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async updateProfile(updates: Partial<Profile>) {
    const current = await this.getProfile(this.agent.session?.did || '');
    if (!current) {
      throw new Error('Profile not found');
    }

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.profile`,
      rkey: 'self',
      record: {
        ...current,
        ...updates,
        $type: `${LEXICON_PREFIX}.profile`,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  // Affiliation operations
  async listAffiliations(did: string): Promise<Affiliation[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.affiliation`,
    });
    return response.data.records.map((r) => r.value as unknown as Affiliation);
  }

  async createAffiliation(
    affiliation: Omit<Affiliation, 'createdAt'>
  ): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.affiliation`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.affiliation`,
        ...affiliation,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateAffiliation(rkey: string, updates: Partial<Affiliation>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.affiliation`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.affiliation`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.affiliation`,
      },
    });
  }

  async deleteAffiliation(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.affiliation`,
      rkey,
    });
  }

  // WebLink operations (all links: social, academic, and custom web)
  async listWebLinks(did: string): Promise<(WebLink & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.link`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as WebLink),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createWebLink(link: Omit<WebLink, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.link`,
        ...link,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateWebLink(rkey: string, updates: Partial<WebLink>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.link`,
      },
    });
  }

  async deleteWebLink(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.link`,
      rkey,
    });
  }

  // Work operations
  async listWorks(did: string): Promise<(Work & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.work`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Work),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createWork(work: Omit<Work, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.work`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.work`,
        ...work,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateWork(rkey: string, updates: Partial<Work>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.work`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.work`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.work`,
      },
    });
  }

  async deleteWork(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.work`,
      rkey,
    });
  }

  // Event operations
  async listEvents(did: string): Promise<(Event & { rkey: string })[]> {
    const response = await this.agent.com.atproto.repo.listRecords({
      repo: did,
      collection: `${LEXICON_PREFIX}.event`,
    });
    return response.data.records.map((r) => ({
      ...(r.value as unknown as Event),
      rkey: r.uri.split('/').pop() || '',
    }));
  }

  async createEvent(event: Omit<Event, 'createdAt'>): Promise<string> {
    const rkey = TID.nextStr();
    await this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.event`,
      rkey,
      record: {
        $type: `${LEXICON_PREFIX}.event`,
        ...event,
        createdAt: new Date().toISOString(),
      },
    });
    return rkey;
  }

  async updateEvent(rkey: string, updates: Partial<Event>) {
    const record = await this.agent.com.atproto.repo.getRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.event`,
      rkey,
    });

    return this.agent.com.atproto.repo.putRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.event`,
      rkey,
      record: {
        ...record.data.value,
        ...updates,
        $type: `${LEXICON_PREFIX}.event`,
      },
    });
  }

  async deleteEvent(rkey: string) {
    return this.agent.com.atproto.repo.deleteRecord({
      repo: this.agent.session?.did || '',
      collection: `${LEXICON_PREFIX}.event`,
      rkey,
    });
  }
}
