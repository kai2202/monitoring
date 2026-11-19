---
name: performance-optimization
description: Optimizes application performance across frontend, backend, queries, and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing, or when profiling reveals bottlenecks.
---

# Performance Optimization

## Overview

Measure before optimizing. Performance work without measurement is guessing — and guessing leads to premature optimization that adds complexity without improving what matters. Profile first, identify the actual bottleneck, fix it, measure again. Optimize only what measurements prove matters.

## The Optimization Workflow

```
1. MEASURE  → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX      → Address the specific bottleneck
4. VERIFY   → Measure again; keep or revert
5. GUARD    → Add monitoring or tests to prevent regression
```
