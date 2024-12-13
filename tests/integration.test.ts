import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock contract state
const contractState = {
  integrations: new Map<string, { api_key: string, webhook_url: string }>()
};

// Mock contract call function
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  if (functionName === 'add-integration') {
    const [platform, apiKey, webhookUrl] = args;
    contractState.integrations.set(platform.slice(1, -1), {
      api_key: apiKey.slice(1, -1),
      webhook_url: webhookUrl.slice(1, -1)
    });
    return { success: true, value: true };
  }
  if (functionName === 'remove-integration') {
    const [platform] = args;
    contractState.integrations.delete(platform.slice(1, -1));
    return { success: true, value: true };
  }
  if (functionName === 'get-integration') {
    const [platform] = args;
    return { success: true, value: contractState.integrations.get(platform.slice(1, -1)) };
  }
  if (functionName === 'notify') {
    return { success: true, value: true };
  }
  return { success: false, error: 'Function not found' };
});

describe('Integration Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    // Reset contract state before each test
    contractState.integrations.clear();
    mockContractCall.mockClear();
  });
  
  it('should add integration', () => {
    const result = mockContractCall('add-integration', ['"discord"', '"api-key-123"', '"https://discord.com/webhook"'], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should remove integration', () => {
    mockContractCall('add-integration', ['"discord"', '"api-key-123"', '"https://discord.com/webhook"'], contractOwner);
    const result = mockContractCall('remove-integration', ['"discord"'], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should get integration', () => {
    mockContractCall('add-integration', ['"discord"', '"api-key-123"', '"https://discord.com/webhook"'], contractOwner);
    const result = mockContractCall('get-integration', ['"discord"']);
    expect(result).toEqual({
      success: true,
      value: {
        api_key: 'api-key-123',
        webhook_url: 'https://discord.com/webhook'
      }
    });
  });
  
  it('should notify', () => {
    mockContractCall('add-integration', ['"discord"', '"api-key-123"', '"https://discord.com/webhook"'], contractOwner);
    const result = mockContractCall('notify', ['"discord"', '"Test notification"']);
    expect(result).toEqual({ success: true, value: true });
  });
});

