import type { ErrorType } from '@grandlinex/swagger-mate';

export default class TableQueryFields extends Map<
  string,
  string | number | boolean | number[] | string[]
> {
  getString(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return typeof val === 'string' ? val : null;
  }

  getNumber(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return typeof val === 'number' ? val : null;
  }

  getInt(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return typeof val === 'number' && Number.isInteger(val) ? val : null;
  }

  getBool(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return typeof val === 'boolean' ? val : null;
  }

  getNumberArr(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return Array.isArray(val) && val.every((v) => typeof v === 'number')
      ? val
      : null;
  }

  getStringArr(key: string) {
    const val = this.get(key);
    if (val === undefined) return undefined;
    return Array.isArray(val) && val.every((v) => typeof v === 'string')
      ? val
      : null;
  }

  validateFields<T extends object>(fc: (q: this) => T) {
    return TableQueryFields.validate(fc(this));
  }

  static validate<T extends object>(
    obj: T,
  ): {
    fields: { [K in keyof T]: Exclude<T[K], null> };
    error: Partial<ErrorType> | null;
  } {
    const errorKeys = Object.entries(obj)
      .filter(([, value]) => value === null)
      .map(([key]) => key);

    let error: Partial<ErrorType> | null = null;
    if (errorKeys.length > 0) {
      error = {
        field: errorKeys.map(([key]) => ({
          key,
          message: 'Invalid type',
        })),
      };
    }

    return {
      fields: obj as any,
      error,
    };
  }
}
