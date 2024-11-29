export const operations = [
    { name: 'Suma', operator: '+' },
    { name: 'Resta', operator: '-' },
    { name: 'Multiplicación', operator: '*' },
    { name: 'División', operator: '/' },
    { name: 'Residuo', operator: '%' },
    { name: 'Potencia', operator: '^' }
];

export const ENUM_OPERATIONS = {
    SUMA: '+',
    RESTA: '-',
    MULTIPLICACION: '*',
    DIVISION: '/',
    RESIDUO: '%',
    POTENCIA: '^'
};

export interface Operation{
    (a: number, b: number) : number
};

export const functionOperations = new Map<string, Operation>([
    ['+', (a: number, b:number) => a + b ],
    ['-', (a: number, b:number) => a - b ],
    ['*', (a: number, b:number) => a * b ],
    ['/', (a: number, b:number) => a / b ],
    ['%', (a: number, b:number) => a % b ],
    ['^', (a: number, b:number) => Math.pow(a, b) ]
]);

export const defaultOperation : Operation = (a: number, b: number) => a + b;