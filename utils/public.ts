export type Public<T> = { [P in keyof T]: T[P] };
