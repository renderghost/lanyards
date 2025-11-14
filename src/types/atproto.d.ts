// Type declarations for AT Protocol packages to fix generated type imports
// These are used by the auto-generated lexicon types from @atproto/lex-cli

declare namespace ComAtprotoRepoListRecords {
  export interface QueryParams {
    repo: string;
    collection: string;
    limit?: number;
    cursor?: string;
    reverse?: boolean;
  }
}

declare namespace ComAtprotoRepoGetRecord {
  export interface QueryParams {
    repo: string;
    collection: string;
    rkey: string;
    cid?: string;
  }
}

declare namespace ComAtprotoRepoCreateRecord {
  export interface InputSchema {
    repo: string;
    collection: string;
    rkey?: string;
    validate?: boolean;
    record: Record<string, unknown>;
    swapCommit?: string;
  }
}

declare namespace ComAtprotoRepoPutRecord {
  export interface InputSchema {
    repo: string;
    collection: string;
    rkey: string;
    validate?: boolean;
    record: Record<string, unknown>;
    swapRecord?: string;
    swapCommit?: string;
  }
}

declare namespace ComAtprotoRepoDeleteRecord {
  export interface InputSchema {
    repo: string;
    collection: string;
    rkey: string;
    swapRecord?: string;
    swapCommit?: string;
  }
}
