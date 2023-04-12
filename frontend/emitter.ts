// deno-lint-ignore-file no-case-declarations no-explicit-any
/*
    Interprets AST
*/

import { Token, TokenType } from "./lexer/token_types.ts";
import * as AST from "./parser/ast.ts"
import Parser from "./parser/parser.ts"

// A buffer of statements that is colllected on deeper levels (within blocks)
class StmtBuffer {
    private stmts: unknown[] = [];

    add(result: unknown)
    {
        if (result != Emitter.SUCCESS_CASE)
            this.stmts.push(result);
    }

    retrieve()
    {
        return this.stmts;
    }
    
    public static isBuffer(test: unknown)
    {
        return (test as StmtBuffer).stmts != null;
    }
}

export class Emitter{
    private variables = new Map<string, unknown>();
    public static SUCCESS_CASE = new Token("SUCCESS", TokenType.EOL);
    private OUTPUT_CASE = new Token("out", TokenType.Output);

    emitStmt(stmt: AST.Stmt)
    {
        switch(stmt.kind)
        {
            case "VariableAssignment":
                const assignment = stmt as AST.VariableAssignment;
                let varVal = this.emitStmt(assignment.value); // Right hand side
                if (this.variables.get(assignment.identifier.value) != null)
                {
                    switch (assignment.operator)
                    {
                        case "+=":
                            varVal = this.variables.get(assignment.identifier.value) + varVal;
                            break;
                        case "-=":
                            varVal = (this.variables.get(assignment.identifier.value) as number) - varVal;
                            break;
                        case "*=":
                            varVal = (this.variables.get(assignment.identifier.value) as number) * varVal;
                            break;
                        case "/=":
                            varVal = (this.variables.get(assignment.identifier.value) as number) / varVal;
                            break;
                    }
                }

                this.variables.set(assignment.identifier.value, varVal);
                return Emitter.SUCCESS_CASE;
            case "Output":
                const output = stmt as AST.Output;
                return [this.emitExpr(output.value), this.OUTPUT_CASE];
            case "Comment":
                return Emitter.SUCCESS_CASE; // Doesn't need to emit anything
            case "IfStatement":
                const if_statement = stmt as AST.IfStatement;
                const ifTrue = new StmtBuffer(); // Store stmts in a buffer
                if (this.emitExpr(if_statement.condition))
                {
                    if_statement.true.body.forEach(innerStmt => {
                        ifTrue.add(this.emitStmt(innerStmt));
                    });
                    return ifTrue as StmtBuffer;
                }
                return Emitter.SUCCESS_CASE; // If false
            default:
                return this.emitExpr(stmt); // Must be an expression
        }
    }

    emitExpr(expr: AST.Expr) : any
    {
        switch (expr.kind)
        {
            case "Number":
                return (expr as AST.Number).value;
            case "String":
                return (expr as AST.String).value;
            case "Identifier":
                return this.variables.get((expr as AST.Identifier).value);
            case "BooleanExpression":
                const boolExpr = expr as AST.BooleanExpression;
                const leftBoolValue: any = this.emitExpr(boolExpr.left);
                const rightBoolValue: any = this.emitExpr(boolExpr.right);
                switch (boolExpr.operator)
                {
                    case ">":
                        return leftBoolValue > rightBoolValue;
                    case "<":
                        return leftBoolValue < rightBoolValue;
                    case "==":
                        return leftBoolValue == rightBoolValue;
                    default:
                        return null;
                }
            case "BinaryExpression":
                const binExpr = expr as AST.BinaryExpression;
                const leftValue: any = this.emitExpr(binExpr.left);
                const rightValue: any = this.emitExpr(binExpr.right);
                const leftType = typeof leftValue;
                const rightType = typeof rightValue;

                switch (binExpr.operator)
                {
                    case "+":
                        if ((leftType == "number" || leftType == "string") && (rightType == "number" || rightType == "string"))
                            return leftValue + rightValue;
                        break;
                    case "-":
                        if (leftType == "number" && rightType == "number")
                            return (leftValue as number) - (rightValue as number);
                        break;
                    case "*":
                        if (leftType == "number" && rightType == "number")
                            return (leftValue as number) * (rightValue as number);
                        break;
                    case "/":
                        if (leftType == "number" && rightType == "number")
                            return (leftValue as number) / (rightValue as number);
                        break;
                }
                break;
            case "Type":
                return (typeof (this.emitExpr((expr as AST.Type).value))) as string;
            case "TernaryOperator":
                const ternary = expr as AST.TernaryOperator;
                // Using a ternary operator to determine ternary operations ;)
                return this.emitExpr(ternary.condition) ? this.emitExpr(ternary.true) : this.emitExpr(ternary.false);
        }
    }

    public emitSrc(rawSrc: string)
    {
        const parser = new Parser();
        const program = parser.Parse(rawSrc);
        const results: unknown[] = [];

        program.body.body.forEach(astNode => {
            const result = this.emitStmt(astNode); 

            // Check if raw result or buffer is received
            if (StmtBuffer.isBuffer(result))
            {
                (result as StmtBuffer).retrieve().forEach(stmt => {
                    if (result != Emitter.SUCCESS_CASE)
                        results.push(stmt);
                });

            }else{
                if (result != Emitter.SUCCESS_CASE)
                    results.push(result);
            }
        });

        return results;
    }
}
