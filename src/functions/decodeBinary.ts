import {DecodedHashData} from "../typings/interfaces/DecodedHashData";
import readUInt32LE from "./readUInt32LE";

export default function (data: Buffer): DecodedHashData {
    return {
        start: readUInt32LE(data)
    }
}