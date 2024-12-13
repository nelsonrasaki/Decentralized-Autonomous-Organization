import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock contract state
const contractState = {
  lastProposalId: 0,
  proposals: new Map<number, any>()
};

// Mock contract call function
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  if (functionName === 'create-proposal') {
    const [title, description, governance] = args;
    const proposalId = ++contractState.lastProposalId;
    contractState.proposals.set(proposalId, {
      title: title.slice(1, -1),
      description: description.slice(1, -1),
      proposer: sender,
      start_block: 100,
      end_block: 1540,
      status: 'active',
      yes_votes: 0,
      no_votes: 0
    });
    return { success: true, value: proposalId };
  }
  if (functionName === 'vote-on-proposal') {
    const [proposalId, vote] = args;
    const proposal = contractState.proposals.get(parseInt(proposalId.slice(1)));
    if (proposal) {
      if (vote === '"yes"') proposal.yes_votes++;
      if (vote === '"no"') proposal.no_votes++;
    }
    return { success: true, value: true };
  }
  if (functionName === 'execute-proposal') {
    const [proposalId] = args;
    const proposal = contractState.proposals.get(parseInt(proposalId.slice(1)));
    if (proposal) {
      proposal.status = proposal.yes_votes > proposal.no_votes ? 'passed' : 'rejected';
    }
    return { success: true, value: true };
  }
  if (functionName === 'get-proposal') {
    const [proposalId] = args;
    return { success: true, value: contractState.proposals.get(parseInt(proposalId.slice(1))) };
  }
  return { success: false, error: 'Function not found' };
});

describe('Proposal Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const user2 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    // Reset contract state before each test
    contractState.lastProposalId = 0;
    contractState.proposals.clear();
    mockContractCall.mockClear();
  });
  
  it('should create proposal', () => {
    const result = mockContractCall('create-proposal', ['"Test Proposal"', '"This is a test proposal"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user1);
    expect(result).toEqual({ success: true, value: 1 });
  });
  
  it('should vote on proposal', () => {
    mockContractCall('create-proposal', ['"Test Proposal"', '"This is a test proposal"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user1);
    const result = mockContractCall('vote-on-proposal', ['u1', '"yes"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user2);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should execute proposal', () => {
    mockContractCall('create-proposal', ['"Test Proposal"', '"This is a test proposal"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user1);
    mockContractCall('vote-on-proposal', ['u1', '"yes"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user2);
    const result = mockContractCall('execute-proposal', ['u1', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.treasury'], contractOwner);
    expect(result).toEqual({ success: true, value: true });
  });
  
  it('should get proposal', () => {
    mockContractCall('create-proposal', ['"Test Proposal"', '"This is a test proposal"', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance'], user1);
    const result = mockContractCall('get-proposal', ['u1']);
    expect(result).toEqual({
      success: true,
      value: {
        title: 'Test Proposal',
        description: 'This is a test proposal',
        proposer: user1,
        start_block: 100,
        end_block: 1540,
        status: 'active',
        yes_votes: 0,
        no_votes: 0
      }
    });
  });
});

