import { useState, useCallback } from 'react';
import type { LandingData } from './useLocalStorage';
import { publishToGitHub, loadFromGitHub } from '../services/githubService';
import { restoreAssetUrls } from '../services/assetExtractor';

const TOKEN_KEY = 'github_token';
const BRANCH_KEY = 'github_branch';

export interface GitHubState {
  token: string;
  branch: string;
  isPublishing: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  setToken: (token: string) => void;
  setBranch: (branch: string) => void;
  publish: (data: LandingData) => Promise<void>;
  loadConfig: () => Promise<LandingData | null>;
}

export function useGitHub(): GitHubState {
  const [token, setTokenState] = useState<string>(
    () => localStorage.getItem(TOKEN_KEY) || '',
  );
  const [branch, setBranchState] = useState<string>(
    () => localStorage.getItem(BRANCH_KEY) || '',
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setToken = useCallback((value: string) => {
    setTokenState(value);
    localStorage.setItem(TOKEN_KEY, value);
  }, []);

  const setBranch = useCallback((value: string) => {
    setBranchState(value);
    localStorage.setItem(BRANCH_KEY, value);
  }, []);

  const isConfigured = !!(token && branch);

  const publish = useCallback(
    async (data: LandingData) => {
      if (!isConfigured) return;
      setIsPublishing(true);
      try {
        await publishToGitHub(data, branch, token);
        alert('Published to GitHub successfully!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        alert(`GitHub publish failed: ${message}`);
      } finally {
        setIsPublishing(false);
      }
    },
    [token, branch, isConfigured],
  );

  const loadConfig = useCallback(async (): Promise<LandingData | null> => {
    if (!isConfigured) return null;
    setIsLoading(true);
    try {
      const data = await loadFromGitHub(branch, token);
      if (!data) return null;
      return restoreAssetUrls(data, branch);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Failed to load from GitHub: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, branch, isConfigured]);

  return {
    token,
    branch,
    isPublishing,
    isLoading,
    isConfigured,
    setToken,
    setBranch,
    publish,
    loadConfig,
  };
}
