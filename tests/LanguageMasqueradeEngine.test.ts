import { describe, it, expect } from 'vitest';
import { LanguageMasqueradeEngine, languageMasqueradeEngine } from '../lib/services/LanguageMasqueradeEngine';

describe('LanguageMasqueradeEngine', () => {
  it('exposes list of supported languages and presets', () => {
    expect(LanguageMasqueradeEngine.LANGUAGES.length).toBeGreaterThanOrEqual(8);
    expect(LanguageMasqueradeEngine.PRESETS.length).toBe(4);

    const devops = LanguageMasqueradeEngine.LANGUAGES.find(l => l.id === 'devops');
    expect(devops).toBeDefined();

    const devopsPreset = LanguageMasqueradeEngine.PRESETS.find(p => p.id === 'devops_cloud');
    expect(devopsPreset).toBeDefined();
  });

  it('generates TypeScript code file with valid structure', () => {
    const file = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'typescript',
    });

    expect(file.language).toBe('TypeScript');
    expect(file.path.endsWith('.ts')).toBe(true);
    expect(file.bytes).toBeGreaterThan(100);
    expect(file.content).toContain('export');
  });

  it('generates Python code file with valid structure', () => {
    const file = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'python',
    });

    expect(file.language).toBe('Python');
    expect(file.path.endsWith('.py')).toBe(true);
    expect(file.content).toContain('class');
  });

  it('generates DevOps suite files (Terraform HCL, Kubernetes YAML, Shell)', () => {
    const file1 = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'devops',
    });
    expect(file1.path.endsWith('.tf')).toBe(true);
    expect(file1.content).toContain('resource "aws_vpc"');

    const file2 = languageMasqueradeEngine.generateFileForCommit(2, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'devops',
    });
    expect(file2.path.endsWith('.yaml')).toBe(true);
    expect(file2.content).toContain('apiVersion: apps/v1');

    const file3 = languageMasqueradeEngine.generateFileForCommit(3, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'devops',
    });
    expect(file3.path.endsWith('.sh')).toBe(true);
    expect(file3.content).toContain('#!/usr/bin/env bash');
  });

  it('generates multi-language presets (Full-Stack, DevOps, Systems, AI/ML)', () => {
    const fsFile1 = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'preset',
      preset: 'fullstack',
    });
    expect(fsFile1.path.endsWith('.ts')).toBe(true);

    const fsFile3 = languageMasqueradeEngine.generateFileForCommit(3, '2024-01-01T12:00:00Z', {
      mode: 'preset',
      preset: 'fullstack',
    });
    expect(fsFile3.path.endsWith('.py')).toBe(true);

    const devopsFile = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'preset',
      preset: 'devops_cloud',
    });
    expect(devopsFile.path.startsWith('infra/') || devopsFile.path.startsWith('deploy/')).toBe(true);
  });

  it('evolves modules organically with mutations on subsequent cycles', () => {
    const scaffold = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'typescript',
    });

    // Commit 4 cycles back to module 0 (assuming pool length 3)
    const mutated = languageMasqueradeEngine.generateFileForCommit(4, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'typescript',
    });

    expect(mutated.path).toBe(scaffold.path);
    expect(mutated.bytes).toBeGreaterThan(scaffold.bytes);
    expect(mutated.content).toContain('Checkpoint mutation');
  });

  it('falls back to classic text log when text mode is requested', () => {
    const textFile = languageMasqueradeEngine.generateFileForCommit(1, '2024-01-01T12:00:00Z', {
      mode: 'single',
      language: 'text',
    });

    expect(textFile.path).toBe('logs/contra_log_1.txt');
    expect(textFile.content).toContain('ContraGit automation checkpoint: 1');
  });
});
