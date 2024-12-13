import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock contract state
const contractState = {
  signers: new Map<string, number>(),
  totalWeight: 0,
  threshold: 0
};

// Mock contract call function
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  if (functionName === 'add-signer') {
    const [signer, weight] = args;
    contractState.signers.set(signer, parseInt(weight.slice(1)));
    contractState.totalWeight += parseInt(weight.slice(1));
    return { success: true, value: true };
  }
  if (functionName === 'remove-signer') {
    const [signer] = args;
    const weight = contractState.signers.get(signer) || 0;
    contractState.signers.delete(signer);
    contractState.totalWeight -= weight;
    return { success: true, value: true };
  }
  if (functionName === 'set-threshold') {
    contractState.threshold = parseInt(args[0].slice(1));
    return { success: true, value: true };
  }
  if (functionName === 'transfer') {
    const [amount, recipient] = args;
    const senderWeight = contractState.signers.get(sender) || 0;
    if (senderWeight >= contractState.threshold) {
      return { success: true, value: true };
    }
    return { success: false, error: 'Threshold not met' };
  }
  if (functionName === 'get-signer-weight') {
    return { success: true, value: contractState.signers.get(args[0]) || 0 };
  }
  if (functionName === 'get-threshold') {
    return { success: true, value: contractState.threshold };
  }
  if (functionName === 'get-total-weight') {
    return { success: true, value: contractState.totalWeight };
  }
  return { success: false, error: 'Function not found' };
});

describe('Treasury Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const signer1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const signer2 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    // Reset contract state before each test
    contractState.signers.clear();
    contractState.totalWeight = 0;
    contractState.threshold = 0;
    mockContractCall.mockClear();
  });
  
  it('should add signer', () => {
    const result = mockContractCall('add-signer', [signer1, 'u50'], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should remove signer', () => {
    mockContractCall('add-signer', [signer1, 'u50'], contractOwner);
    const result = mockContractCall('remove-signer', [signer1], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should set threshold', () => {
    const result = mockContractCall('set-threshold', ['u75'], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should get signer weight', () => {
    mockContractCall('add-signer', [signer1, 'u50'], contractOwner);
    const result = mockContractCall('get-signer-weight', [signer1]);
    expect(result).toEqual({ success: true, value: 50 });
  });
  
  it('should get threshold', () => {
    mockContractCall('set-threshold', ['u75'], contractOwner);
    const result = mockContractCall('get-threshold', []);
    expect(result).toEqual({ success: true, value: 75 });
  });
  
  it('should get total weight', () => {
    mockContractCall('add-signer', [signer1, 'u50'], contractOwner);
    mockContractCall('add-signer', [signer2, 'u50'], contractOwner);
    const result = mockContractCall('get-total-weight', []);
    expect(result).toEqual({ success: true, value: 100 });
  });
});

