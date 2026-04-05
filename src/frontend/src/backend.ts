// Stub backend interface for frontend-only build
// This file satisfies type imports from config.ts and useActor.ts

export interface backendInterface {
  _initializeAccessControlWithSecret: (token: string) => Promise<void>;
}

export interface CreateActorOptions {
  agentOptions?: Record<string, unknown>;
  agent?: unknown;
  processError?: (e: unknown) => never;
}

export class ExternalBlob {
  async getBytes(): Promise<Uint8Array> {
    return new Uint8Array();
  }
  onProgress?: (progress: number) => void;
  static fromURL(_url: string): ExternalBlob {
    return new ExternalBlob();
  }
}

export async function createActor(
  _canisterId: string,
  _uploadFile?: unknown,
  _downloadFile?: unknown,
  _options?: CreateActorOptions,
): Promise<backendInterface> {
  throw new Error("Backend not available in frontend-only mode");
}
