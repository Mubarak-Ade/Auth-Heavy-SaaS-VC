declare module "bcryptjs" {
  export function hash(value: string, saltOrRounds: string | number): Promise<string>
  export function compare(value: string, hashValue: string): Promise<boolean>

  const bcryptjs: {
    hash: typeof hash
    compare: typeof compare
  }

  export default bcryptjs
}
