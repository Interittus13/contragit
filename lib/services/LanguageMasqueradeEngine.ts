import { 
  TargetLanguageId, 
  TargetPresetId, 
  TargetLanguageConfig, 
  GeneratedCodeFile, 
  LanguageMeta, 
  PresetMeta 
} from '../types/language';

interface CodeTemplate {
  scaffold: (commitNum: number, timestamp: string) => string;
  mutations: Array<(commitNum: number, timestamp: string) => string>;
}

interface ModuleDefinition {
  path: string;
  language: string;
  template: CodeTemplate;
}

export class LanguageMasqueradeEngine {
  public static readonly LANGUAGES: LanguageMeta[] = [
    {
      id: 'typescript',
      label: 'TypeScript',
      extension: '.ts',
      color: '#3178c6',
      description: 'Strictly typed algorithms, interfaces, and utilities',
      folder: 'src/modules/',
    },
    {
      id: 'python',
      label: 'Python',
      extension: '.py',
      color: '#3572A5',
      description: 'Data analytics, algorithms, dataclasses, and services',
      folder: 'src/services/',
    },
    {
      id: 'go',
      label: 'Go',
      extension: '.go',
      color: '#00ADD8',
      description: 'Concurrent routines, channels, structs, and pipelines',
      folder: 'pkg/engine/',
    },
    {
      id: 'rust',
      label: 'Rust',
      extension: '.rs',
      color: '#dea584',
      description: 'Zero-cost abstractions, traits, and memory-safe math',
      folder: 'src/core/',
    },
    {
      id: 'devops',
      label: 'DevOps (HCL & YAML)',
      extension: '.tf / .yaml',
      color: '#7B42BC',
      description: 'Terraform HCL infrastructure, Kubernetes YAML, and Shell scripts',
      folder: 'infra/terraform/ & deploy/k8s/',
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      extension: '.js',
      color: '#f1e05a',
      description: 'Async helpers, DOM utilities, and functional patterns',
      folder: 'src/utils/',
    },
    {
      id: 'cpp',
      label: 'C++',
      extension: '.cpp',
      color: '#f34b7d',
      description: 'High-performance template data structures and algorithms',
      folder: 'src/algorithms/',
    },
    {
      id: 'java',
      label: 'Java',
      extension: '.java',
      color: '#b07219',
      description: 'Enterprise models, design patterns, and services',
      folder: 'src/main/java/',
    },
    {
      id: 'text',
      label: 'Plain Text (Classic)',
      extension: '.txt',
      color: '#6b7280',
      description: 'Lightweight commit checkpoints (fastest, contribution heatmap only)',
      folder: 'logs/',
    },
  ];

  public static readonly PRESETS: PresetMeta[] = [
    {
      id: 'fullstack',
      label: 'Modern Full-Stack',
      badge: 'TS + Python',
      color: '#3178c6',
      description: 'Dominant TypeScript frontend/core with Python data services',
      breakdown: '70% TypeScript, 30% Python',
    },
    {
      id: 'devops_cloud',
      label: 'DevOps & Cloud Infra',
      badge: 'Terraform + K8s',
      color: '#7B42BC',
      description: 'Infrastructure as Code with Terraform HCL, Kubernetes YAML, and Shell automation',
      breakdown: '50% HCL, 35% YAML, 15% Shell',
    },
    {
      id: 'systems',
      label: 'Systems Architect',
      badge: 'Rust + Go',
      color: '#dea584',
      description: 'High-throughput systems programming with Rust and Go routines',
      breakdown: '60% Rust, 40% Go',
    },
    {
      id: 'aiml',
      label: 'AI / ML Engineer',
      badge: 'Python + TS',
      color: '#3572A5',
      description: 'Data science pipelines and tensor math with TypeScript interfaces',
      breakdown: '80% Python, 20% TypeScript',
    },
  ];

  // =========================================================================
  // Module Libraries for Organic Project Evolution
  // =========================================================================

  private readonly typeScriptModules: ModuleDefinition[] = [
    {
      path: 'src/algorithms/cache.ts',
      language: 'TypeScript',
      template: {
        scaffold: (c, t) => `/**
 * @file LRU Cache with TTL Eviction
 * @version 1.0.${c}
 * @timestamp ${t}
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly items = new Map<K, CacheEntry<V>>();

  constructor(capacity: number = 100) {
    if (capacity <= 0) throw new Error('Capacity must be positive');
    this.capacity = capacity;
  }

  public get(key: K): V | undefined {
    const entry = this.items.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.items.delete(key);
      return undefined;
    }
    // Refresh access order
    this.items.delete(key);
    this.items.set(key, entry);
    return entry.value;
  }

  public set(key: K, value: V, ttlMs: number = 60000): void {
    if (this.items.size >= this.capacity) {
      const oldestKey = this.items.keys().next().value;
      if (oldestKey !== undefined) this.items.delete(oldestKey);
    }
    this.items.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  public size(): number {
    return this.items.size;
  }
}
`,
        mutations: [
          (c) => `
// Checkpoint mutation #${c}: Added batch purge utilities
export function purgeExpiredEntries<K, V>(cache: LRUCache<K, V>): number {
  return cache.size();
}
`,
          (c) => `
// Checkpoint mutation #${c}: Added serialization helper
export function serializeCacheSnapshot(snapshotId: string): string {
  return JSON.stringify({ snapshotId, timestamp: Date.now() });
}
`,
        ],
      },
    },
    {
      path: 'src/math/matrix.ts',
      language: 'TypeScript',
      template: {
        scaffold: (c, t) => `/**
 * @file Matrix Math & Spatial Coordinate Transformations
 * @version 1.1.${c}
 * @timestamp ${t}
 */

export type Matrix2D = number[][];

export function createMatrix(rows: number, cols: number, fill: number = 0): Matrix2D {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

export function multiplyMatrices(a: Matrix2D, b: Matrix2D): Matrix2D {
  const aRows = a.length;
  const aCols = a[0].length;
  const bCols = b[0].length;

  const result = createMatrix(aRows, bCols);
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}
`,
        mutations: [
          (c) => `
// Checkpoint mutation #${c}: Determinant computation
export function determinant2x2(m: Matrix2D): number {
  return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
}
`,
        ],
      },
    },
    {
      path: 'src/utils/formatters.ts',
      language: 'TypeScript',
      template: {
        scaffold: (_c, t) => `/**
 * @file Data Formatters & Unit Conversions
 * @timestamp ${t}
 */

export function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return \`\${(bytes / Math.pow(1024, i)).toFixed(2)} \${units[i]}\`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
`,
        mutations: [
          (c) => `
// Checkpoint #${c}: Truncate text with ellipsis
export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? \`\${str.slice(0, maxLength - 1)}…\` : str;
}
`,
        ],
      },
    },
  ];

  private readonly pythonModules: ModuleDefinition[] = [
    {
      path: 'src/analytics/pipeline.py',
      language: 'Python',
      template: {
        scaffold: (c, t) => `"""
Data Processing Pipeline & Moving Average Stream
Version: 1.0.${c}
Timestamp: ${t}
"""
from dataclasses import dataclass, field
from typing import List, Optional
import time

@dataclass
class MetricPoint:
    timestamp: float
    value: float
    tag: str = "default"

class TimeSeriesAnalyzer:
    def __init__(self, window_size: int = 15):
        self.window_size = window_size
        self.points: List[MetricPoint] = []

    def record(self, value: float, tag: str = "default") -> None:
        self.points.append(MetricPoint(timestamp=time.time(), value=value, tag=tag))
        if len(self.points) > self.window_size:
            self.points.pop(0)

    def rolling_mean(self) -> float:
        if not self.points:
            return 0.0
        return sum(p.value for p in self.points) / len(self.points)

    def variance(self) -> float:
        if len(self.points) < 2:
            return 0.0
        mean = self.rolling_mean()
        return sum((p.value - mean) ** 2 for p in self.points) / (len(self.points) - 1)
`,
        mutations: [
          (c) => `
# Checkpoint #${c}: Anomaly detection spike threshold
def detect_spikes(analyzer: TimeSeriesAnalyzer, threshold_sigma: float = 2.5) -> List[MetricPoint]:
    mean = analyzer.rolling_mean()
    var = analyzer.variance()
    std = var ** 0.5
    return [p for p in analyzer.points if abs(p.value - mean) > (threshold_sigma * std)]
`,
        ],
      },
    },
    {
      path: 'src/models/entities.py',
      language: 'Python',
      template: {
        scaffold: (_c, t) => `"""
Entity Data Models & Validation
Timestamp: ${t}
"""
from typing import Dict, Any

class RepositoryEntity:
    def __init__(self, owner: str, name: str, is_private: bool = False):
        self.owner = owner
        self.name = name
        self.is_private = is_private
        self.metadata: Dict[str, Any] = {}

    @property
    def full_name(self) -> str:
        return f"{self.owner}/{self.name}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fullName": self.full_name,
            "private": self.is_private,
            "metadata": self.metadata
        }
`,
        mutations: [
          (c) => `
# Checkpoint #${c}: Slug generation validator
def validate_repo_name(name: str) -> bool:
    return len(name) > 0 and len(name) <= 100 and "/" not in name
`,
        ],
      },
    },
  ];

  private readonly goModules: ModuleDefinition[] = [
    {
      path: 'pkg/concurrency/worker.go',
      language: 'Go',
      template: {
        scaffold: (c, t) => `// Package concurrency provides an organic worker pool pattern
// Version: 1.0.${c}
// Timestamp: ${t}
package concurrency

import (
	"context"
	"sync"
)

type Job func(ctx context.Context) error

type WorkerPool struct {
	concurrency int
	jobs        chan Job
	wg          sync.WaitGroup
}

func NewWorkerPool(concurrency int, bufferSize int) *WorkerPool {
	return &WorkerPool{
		concurrency: concurrency,
		jobs:        make(chan Job, bufferSize),
	}
}

func (wp *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < wp.concurrency; i++ {
		wp.wg.Add(1)
		go func(workerID int) {
			defer wp.wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-wp.jobs:
					if !ok {
						return
					}
					_ = job(ctx)
				}
			}
		}(i)
	}
}

func (wp *WorkerPool) Submit(job Job) {
	wp.jobs <- job
}

func (wp *WorkerPool) Stop() {
	close(wp.jobs)
	wp.wg.Wait()
}
`,
        mutations: [
          (c) => `
// Checkpoint #${c}: Safe worker queue metrics inspection
func (wp *WorkerPool) QueuedJobs() int {
	return len(wp.jobs)
}
`,
        ],
      },
    },
  ];

  private readonly rustModules: ModuleDefinition[] = [
    {
      path: 'src/engine/matrix.rs',
      language: 'Rust',
      template: {
        scaffold: (c, t) => `//! High-performance Linear Algebra and Vector Utilities
//! Checkpoint: ${c} | Timestamp: ${t}

#[derive(Debug, Clone, PartialEq)]
pub struct Vector3D {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vector3D {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    pub fn magnitude(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2) + self.z.powi(2)).sqrt()
    }

    pub fn normalize(&self) -> Option<Self> {
        let mag = self.magnitude();
        if mag == 0.0 {
            None
        } else {
            Some(Self {
                x: self.x / mag,
                y: self.y / mag,
                z: self.z / mag,
            })
        }
    }

    pub fn dot(&self, other: &Self) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }
}
`,
        mutations: [
          (c) => `
// Checkpoint #${c}: Cross product vector calculation
impl Vector3D {
    pub fn cross(&self, other: &Self) -> Self {
        Self {
            x: self.y * other.z - self.z * other.y,
            y: self.z * other.x - self.x * other.z,
            z: self.x * other.y - self.y * other.x,
        }
    }
}
`,
        ],
      },
    },
  ];

  // =========================================================================
  // DevOps Suite: Terraform (HCL), Kubernetes / GitHub Actions (YAML), Shell
  // =========================================================================

  private readonly devOpsModules: ModuleDefinition[] = [
    {
      path: 'infra/terraform/modules/vpc/main.tf',
      language: 'HCL',
      template: {
        scaffold: (c, t) => `/**
 * Cloud Infrastructure VPC Module
 * Checkpoint: ${c} | Provisioned: ${t}
 */

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_vpc" "primary" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "production-core-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.primary.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-\${count.index + 1}"
    Tier = "public"
  }
}
`,
        mutations: [
          (c) => `
# Checkpoint #${c}: Internet Gateway and Routing
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.primary.id

  tags = {
    Name = "primary-igw"
  }
}
`,
        ],
      },
    },
    {
      path: 'deploy/kubernetes/api-deployment.yaml',
      language: 'YAML',
      template: {
        scaffold: (c, t) => `# Kubernetes Production Deployment
# Checkpoint: ${c} | Synchronized: ${t}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: production
  labels:
    app.kubernetes.io/name: api-gateway
    app.kubernetes.io/part-of: cloud-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: gateway
          image: ghcr.io/org/api-gateway:v1.2.${c}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              name: http
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1024Mi
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
`,
        mutations: [
          (c) => `
---
# Checkpoint #${c}: Kubernetes ClusterIP Service Definition
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-svc
  namespace: production
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
      name: http
  selector:
    app: api-gateway
`,
        ],
      },
    },
    {
      path: 'scripts/ci/deploy.sh',
      language: 'Shell',
      template: {
        scaffold: (c, t) => `#!/usr/bin/env bash
# Production Continuous Delivery Script
# Checkpoint: ${c} | Generated: ${t}
set -euo pipefail

ENVIRONMENT="\${1:-production}"
echo "[CI/CD] Preparing deployment for environment: \${ENVIRONMENT}..."

verify_prerequisites() {
  command -v kubectl >/dev/null 2>&1 || { echo >&2 "Error: kubectl is required."; exit 1; }
  command -v terraform >/dev/null 2>&1 || { echo >&2 "Error: terraform is required."; exit 1; }
}

deploy_manifests() {
  echo "[Kube] Applying manifests to namespace: \${ENVIRONMENT}..."
  kubectl apply -k "./deploy/kubernetes/overlays/\${ENVIRONMENT}" --record
}

verify_prerequisites
deploy_manifests
echo "[CI/CD] Deployment completed successfully."
`,
        mutations: [
          (c) => `
# Checkpoint #${c}: Post-deployment smoke healthcheck
check_rollout_status() {
  kubectl rollout status deployment/api-gateway -n "\${ENVIRONMENT}" --timeout=120s
}
check_rollout_status
`,
        ],
      },
    },
  ];

  // =========================================================================
  // Primary Generator Entrypoint
  // =========================================================================

  public generateFileForCommit(
    commitNum: number,
    timestamp: string,
    config?: TargetLanguageConfig
  ): GeneratedCodeFile {
    // 1. Classic lightweight text mode fallback
    if (config?.mode === 'single' && config.language === 'text') {
      const content = `ContraGit automation checkpoint: ${commitNum} on ${timestamp}\n`;
      return {
        path: `logs/contra_log_${commitNum}.txt`,
        content,
        language: 'Text',
        bytes: Buffer.byteLength(content, 'utf8'),
      };
    }

    // 2. Resolve module collection based on preset or single language
    let pool: ModuleDefinition[];

    if (config?.mode === 'preset') {
      pool = this.getModulesForPreset(config.preset || 'fullstack', commitNum);
    } else {
      const lang = config?.language || 'typescript';
      pool = this.getModulesForLanguage(lang);
    }

    if (!pool || pool.length === 0) {
      pool = this.typeScriptModules;
    }

    // 3. Select module deterministically using organic round-robin
    const moduleIndex = (commitNum - 1) % pool.length;
    const selected = pool[moduleIndex];

    // 4. Determine evolution stage (scaffold vs mutated update)
    const cycle = Math.floor((commitNum - 1) / pool.length);
    let content = selected.template.scaffold(commitNum, timestamp);

    if (cycle > 0 && selected.template.mutations.length > 0) {
      const mutationIndex = (cycle - 1) % selected.template.mutations.length;
      content += selected.template.mutations[mutationIndex](commitNum, timestamp);
    }

    return {
      path: selected.path,
      content,
      language: selected.language,
      bytes: Buffer.byteLength(content, 'utf8'),
    };
  }

  private getModulesForLanguage(lang: TargetLanguageId): ModuleDefinition[] {
    switch (lang) {
      case 'typescript':
        return this.typeScriptModules;
      case 'python':
        return this.pythonModules;
      case 'go':
        return this.goModules;
      case 'rust':
        return this.rustModules;
      case 'devops':
        return this.devOpsModules;
      case 'javascript':
        return this.typeScriptModules.map(m => ({
          ...m,
          path: m.path.replace(/\.ts$/, '.js'),
          language: 'JavaScript',
        }));
      case 'cpp':
        return [
          {
            path: 'src/algorithms/vector_sort.cpp',
            language: 'C++',
            template: {
              scaffold: (c, t) => `/**
 * Fast Vector Algorithm & Heuristic Partitioning
 * Version: 1.0.${c} | Timestamp: ${t}
 */
#include <vector>
#include <algorithm>
#include <iostream>

template<typename T>
void quickSortPartition(std::vector<T>& vec, int low, int high) {
    if (low < high) {
        T pivot = vec[high];
        int i = (low - 1);
        for (int j = low; j <= high - 1; j++) {
            if (vec[j] < pivot) {
                i++;
                std::swap(vec[i], vec[j]);
            }
        }
        std::swap(vec[i + 1], vec[high]);
    }
}
`,
              mutations: [(c) => `\n// Checkpoint #${c}: Thread-safe clamp utility\n`],
            },
          },
        ];
      case 'java':
        return [
          {
            path: 'src/main/java/com/contra/service/MatrixService.java',
            language: 'Java',
            template: {
              scaffold: (c, t) => `package com.contra.service;

/**
 * Enterprise Matrix Engine Service
 * Version: 1.0.${c} | Timestamp: ${t}
 */
public class MatrixService {
    private final int capacity;

    public MatrixService(int capacity) {
        this.capacity = capacity;
    }

    public int getCapacity() {
        return this.capacity;
    }
}
`,
              mutations: [(c) => `\n// Checkpoint #${c}: Additional service validation\n`],
            },
          },
        ];
      default:
        return this.typeScriptModules;
    }
  }

  private getModulesForPreset(preset: TargetPresetId, commitNum: number): ModuleDefinition[] {
    switch (preset) {
      case 'devops_cloud':
        // 50% HCL, 35% YAML, 15% Shell (Cycle through devOpsModules)
        return this.devOpsModules;
      case 'fullstack':
        // 70% TypeScript, 30% Python
        return commitNum % 3 === 0 ? this.pythonModules : this.typeScriptModules;
      case 'systems':
        // 60% Rust, 40% Go
        return commitNum % 2 === 0 ? this.goModules : this.rustModules;
      case 'aiml':
        // 80% Python, 20% TypeScript
        return commitNum % 5 === 0 ? this.typeScriptModules : this.pythonModules;
      default:
        return this.typeScriptModules;
    }
  }
}

export const languageMasqueradeEngine = new LanguageMasqueradeEngine();
