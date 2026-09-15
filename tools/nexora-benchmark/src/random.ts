const MASK_64 = 0xffff_ffff_ffff_ffffn;
const SPLITMIX_INCREMENT = 0x9e37_79b9_7f4a_7c15n;
const UINT64_RANGE = 18_446_744_073_709_551_616;

function hash64(value: string): bigint {
  let hash = 0xcbf2_9ce4_8422_2325n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x0000_0100_0000_01b3n);
  }
  return hash;
}

function mix64(value: bigint): bigint {
  let mixed = value;
  mixed = BigInt.asUintN(64, (mixed ^ (mixed >> 30n)) * 0xbf58_476d_1ce4_e5b9n);
  mixed = BigInt.asUintN(64, (mixed ^ (mixed >> 27n)) * 0x94d0_49bb_1331_11ebn);
  return BigInt.asUintN(64, mixed ^ (mixed >> 31n));
}

export interface NamespacedRandom {
  nextFloat(): number;
  integer(min: number, max: number): number;
  pick<T>(values: readonly T[]): T;
  fork(namespace: string): NamespacedRandom;
}

class SplitMix64Random implements NamespacedRandom {
  private state: bigint;

  constructor(
    private readonly rootSeed: string,
    private readonly namespace: string,
  ) {
    this.state = hash64(`${rootSeed}\u0000${namespace}`);
  }

  nextFloat(): number {
    this.state = (this.state + SPLITMIX_INCREMENT) & MASK_64;
    const value = mix64(this.state);
    return Number(value >> 11n) / 9_007_199_254_740_992;
  }

  integer(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
      throw new RangeError(`Expected safe integer bounds with min <= max, received ${min}..${max}`);
    }
    const width = max - min + 1;
    if (!Number.isSafeInteger(width) || width > UINT64_RANGE) {
      throw new RangeError(`Integer range is too wide: ${min}..${max}`);
    }
    return min + Math.floor(this.nextFloat() * width);
  }

  pick<T>(values: readonly T[]): T {
    if (values.length === 0) throw new RangeError('Cannot pick from an empty collection');
    return values[this.integer(0, values.length - 1)] as T;
  }

  fork(namespace: string): NamespacedRandom {
    if (namespace.length === 0) throw new RangeError('A random namespace cannot be empty');
    return new SplitMix64Random(this.rootSeed, `${this.namespace}/${namespace}`);
  }
}

export function createNamespacedRandom(seed: string, namespace: string): NamespacedRandom {
  if (seed.length === 0) throw new RangeError('A random seed cannot be empty');
  if (namespace.length === 0) throw new RangeError('A random namespace cannot be empty');
  return new SplitMix64Random(seed, namespace);
}
