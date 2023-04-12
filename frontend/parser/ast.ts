// deno-lint-ignore-file no-empty-interface
/*
    Different AST Nodes
*/

export interface Stmt { // Statement
    kind: string;
} 

export interface Block { // A series of stmts
    kind: "Block";
    body: Stmt[];
}

export interface Expr extends Stmt { } // Returns value at runtime
export interface Program extends Stmt { // Root
    kind: "Program";
    body: Block;
} 

// Literals
export interface Number extends Expr {
    kind: "Number";
    value: number;
}
export interface Identifier extends Expr {
    kind: "Identifier";
    value: string;
}
export interface String extends Expr {
    kind: "String";
    value: string;
}

// Binary Expression
export interface BinaryExpression extends Expr {
    kind: "BinaryExpression";
    left: Expr;
    right: Expr;
    operator: string;
}

// Boolean Expression
export interface BooleanExpression extends Expr {
    kind: "BooleanExpression";
    left: Expr;
    right: Expr;
    operator: string;
}

// Assignment
export interface VariableAssignment extends Stmt {
    kind: "VariableAssignment";
    identifier: Identifier;
    value: Expr;
    operator: string;
}

// Ternary Operator
export interface TernaryOperator extends Expr {
    kind: "TernaryOperator";
    condition: Expr;
    true: Expr;
    false: Expr;
}

// Output
export interface Output extends Stmt {
    kind: "Output";
    value: Expr;
}

// Type
export interface Type extends Expr {
    kind: "Type";
    value: Expr;
}

// If
export interface IfStatement extends Stmt {
    kind: "IfStatement";
    condition: Expr;
    true: Block;
}

// Comment
export interface Comment extends Stmt {
    kind: "Comment";
    value: string;
}