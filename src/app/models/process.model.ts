export interface Process{
    programmerName: string,
    operation: string,
    operator1: number,
    operator2: number,
    maximumTime: number,
    programId: number,
    result? : number,
    batchNumber? : number,
    elapsedTime : number
};

export interface BatchProcess{
    pendingBatches : number,
    currentBatch : Process[],
    elapsedTime : number,
    executingProcess : Process | null,
    doneProcesses: Process[],
    globalCounter : number
};

export interface MultiprogrammingProcess{
    pendingBatches : number,
    currentBatch : Process[],
    executingProcess : Process | null,
    doneProcesses: Process[],
    globalCounter : number,
    pauseFlag : boolean,
    errorFlag: boolean,
    interruptFlag : boolean
};

export interface BCP{
    operation: string,
    operator1: number,
    operator2: number,
    maximumTime: number,
    programId: number,
    result? : number,
    elapsedTime : number,
    startTime? : number,
    finishTime? : number,
    timeBlocked? : number,
    responseTime? : number,
    returnTime? : number,
    waitTime? : number,
    status? : string,
    currentQuantum? : number
};


export interface BCPMemory{
    operation: string,
    operator1: number,
    operator2: number,
    maximumTime: number,
    programId: number,
    memoryUsed : number,
    result? : number,
    elapsedTime : number,
    startTime? : number,
    finishTime? : number,
    timeBlocked? : number,
    responseTime? : number,
    returnTime? : number,
    waitTime? : number,
    status? : string,
    currentQuantum? : number
};

export interface FCFSProcess {
    newQty : number,
    globalCounter : number,
    ready : BCP[],
    executing : BCP | null,
    blocked: BCP[],
    finished : BCP[],
    pauseFlag : boolean,
    errorFlag : boolean,
    interruptFlag : boolean,
    inputFlag : boolean,
};

export interface RRProcess {
    newQty : number,
    globalCounter : number,
    ready : BCP[],
    executing : BCP | null,
    blocked: BCP[],
    finished : BCP[],
    pauseFlag : boolean,
    errorFlag : boolean,
    interruptFlag : boolean,
    inputFlag : boolean,
    contextChangeFlag : boolean
};

export interface MemoryFrame{
    id: number,
    size: number, 
    used: number, 
    status: string 
    process: number
};
export interface SimplePagingProcess {
    newQty : number,
    globalCounter : number,
    ready : BCPMemory[],
    executing : BCPMemory | null,
    blocked: BCPMemory[],
    finished : BCPMemory[],
    pauseFlag : boolean,
    errorFlag : boolean,
    interruptFlag : boolean,
    inputFlag : boolean,
    contextChangeFlag : boolean,
    memory: MemoryFrame[]
};

export interface SuspendedBCP{
    programId : number,
    memoryUsed : number
};
export interface SuspendedProcessesProcess {
    filename : string,
    newQty : number,
    suspended : SuspendedBCP[],
    globalCounter : number,
    ready : BCPMemory[],
    executing : BCPMemory | null,
    blocked: BCPMemory[],
    finished : BCPMemory[],
    pauseFlag : boolean,
    errorFlag : boolean,
    interruptFlag : boolean,
    inputFlag : boolean,
    contextChangeFlag : boolean,
    memory: MemoryFrame[]
};