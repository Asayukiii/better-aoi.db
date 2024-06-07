import { DynamicObject } from "../../structures/DynamicObject";

export interface DynamicObjectEvents {
    set: (this: DynamicObject, property: string, value: string) => void | Promise<void>
    delete: (this: DynamicObject, property: string) => void | Promise<void> | void
}