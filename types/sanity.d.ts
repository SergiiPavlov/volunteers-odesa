declare module 'sanity' {
  export interface SanityConfig {
    [key: string]: unknown;
  }

  export interface Rule {
    required(): Rule;
    min(value: number): Rule;
  }

  export type ValidationBuilder = (rule: Rule) => Rule;

  export interface FieldDefinition {
    validation?: ValidationBuilder;
    [key: string]: unknown;
  }

  export function defineConfig<T extends SanityConfig>(config: T): T;
  export function defineField<T extends FieldDefinition>(field: T): T;
  export function defineType<T>(type: T): T;
}

declare module 'sanity/desk' {
  export function deskTool(...args: unknown[]): unknown;
}
