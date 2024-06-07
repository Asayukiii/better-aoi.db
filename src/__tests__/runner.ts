import { fork } from "child_process"

const arg = process.argv[2]

fork(`./dist/__tests__/${arg ?? "test"}.js`)