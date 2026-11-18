import { describe, it, expect } from 'vitest';
import {
  sum,
  average,
  weightedAverage,
  clamp,
  lerp,
  roundTo,
  percentage,
  safeDivide,
  max,
  min,
  range,
} from './index';

describe('utils', () => {
  describe('sum', () => {
    it('should sum an array of numbers', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });
    it('should return 0 for empty array', () => {
      expect(sum([])).toBe(0);
    });
    it('should handle negative numbers', () => {
      expect(sum([-1, -2, 3])).toBe(0);
    });
  });

  describe('average', () => {
    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });
    it('should return 0 for empty array', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('weightedAverage', () => {
    it('should calculate weighted average', () => {
      expect(weightedAverage([1, 2, 3], [1, 1, 1])).toBe(2);
    });
    it('should weight values correctly', () => {
      expect(weightedAverage([10, 20], [1, 3])).toBe(17.5);
    });
    it('should return 0 for empty arrays', () => {
      expect(weightedAverage([], [])).toBe(0);
    });
    it('should return 0 for zero total weight', () => {
      expect(weightedAverage([1, 2], [0, 0])).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
    it('should clamp to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });
    it('should clamp to max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
    });
    it('should return start at t=0', () => {
      expect(lerp(0, 10, 0)).toBe(0);
    });
    it('should return end at t=1', () => {
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimals', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
    });
    it('should round to 0 decimals', () => {
      expect(roundTo(3.7, 0)).toBe(4);
    });
    it('should handle negative decimals', () => {
      expect(roundTo(1234, -2)).toBe(1200);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      expect(percentage(50, 100)).toBe(50);
    });
    it('should return 0 for zero total', () => {
      expect(percentage(50, 0)).toBe(0);
    });
  });

  describe('safeDivide', () => {
    it('should divide normally', () => {
      expect(safeDivide(10, 2)).toBe(5);
    });
    it('should return fallback for zero denominator', () => {
      expect(safeDivide(10, 0, 42)).toBe(42);
    });
    it('should return 0 as default fallback', () => {
      expect(safeDivide(10, 0)).toBe(0);
    });
  });

  describe('max/min', () => {
    it('should find max', () => {
      expect(max(1, 5, 3)).toBe(5);
    });
    it('should find min', () => {
      expect(min(1, 5, 3)).toBe(1);
    });
  });

  describe('range', () => {
    it('should generate range', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });
    it('should respect step', () => {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
    });
  });
});