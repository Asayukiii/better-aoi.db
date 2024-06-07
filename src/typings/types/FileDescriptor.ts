import { If } from "./If";

export type FileDescriptor<K extends boolean = boolean> = If<K, number, null>