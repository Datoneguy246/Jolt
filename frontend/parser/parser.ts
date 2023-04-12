// deno-lint-ignore-file no-case-declarations
import * as AST from "./ast.ts"
import * as LEXER from "../lexer/lexer.ts"
import * as TokenTypes from "../lexer/token_types.ts";

export default class Parser {
    private tokens: TokenTypes.Token[] = [];

    // Gets next token
    advance() : TokenTypes.Token
    {
        return this.tokens.shift() as TokenTypes.Token;
    }

    // Check for EOF
    not_eof(): boolean 
    {
        return this.tokens[0].type != TokenTypes.TokenType.EOF;
    }

    at() : TokenTypes.Token
    {
        return this.tokens[0] as TokenTypes.Token;
    }

    // Parses source code to AST
    public Parse(rawSrc: string) : AST.Program
    {
        this.tokens = LEXER.toTokens(rawSrc);
        const astRoot: AST.Program = {
            kind: "Program",
            body: {
                kind: "Block",
                body: [ ]
            } as AST.Block,
        };
    
        while (this.not_eof())
        {
            astRoot.body.body.push(this.parse_stmt());
            if (this.at().type == TokenTypes.TokenType.EOL)
                this.advance();
        }
    
        return astRoot;
    }
    
    parse_stmt() : AST.Stmt
    {
        return this.parse_comment();
    }

    parse_comment() : AST.Stmt
    {
        if (this.at().type == TokenTypes.TokenType.Comment)
        {
            return {
                kind: "Comment",
                value: this.advance().value
            } as AST.Comment;
        }
        return this.parse_assignment();
    }

    parse_assignment() : AST.Stmt
    {
        // Get left and right side
        let identifier = this.parse_output();
        while (this.at().type == TokenTypes.TokenType.Equals)
        {
            const operator = this.advance().value;
            const value = this.parse_output();

            identifier = {
                kind: "VariableAssignment",
                identifier,
                value,
                operator
            } as AST.Stmt
        }

        return identifier;
    }

    parse_output() : AST.Stmt 
    {
        if (this.at().type == TokenTypes.TokenType.Output)
        {
            this.advance();
            const outputValue = this.parse_if();
            return {
                kind: "Output",
                value: outputValue
            } as AST.Output;
        }else{
            return this.parse_if();
        }
    }

    parse_if() : AST.Stmt
    {
        if (this.at().type == TokenTypes.TokenType.If)
        {
            this.advance();
            const condition = this.parse_expr();
            const statementBody: AST.Stmt[] = [];
            if (this.at().type == TokenTypes.TokenType.OpenBlock)
            {
                this.advance();
                while (this.at().type != TokenTypes.TokenType.CloseBlock)
                {
                    statementBody.push(this.parse_stmt());
                }
                this.advance();
                return {
                    kind: "IfStatement",
                    condition: condition,
                    true: {
                        kind: "Block",
                        body: statementBody
                    } as AST.Block
                } as AST.IfStatement
            }
        }
        return this.parse_expr();
    }

    parse_expr() : AST.Expr
    {
        return this.parse_ternary();
    }

    parse_ternary() : AST.Expr
    {
        const condition = this.parse_type();
        while (this.at().type == TokenTypes.TokenType.Ternary_QMARK)
        {
            this.advance(); // Pass "?" token
            const trueVal = this.parse_type();
            this.advance(); // Pass ":" token
            const falseVal = this.parse_type();
            return {
                kind: "TernaryOperator",
                condition: condition,
                true: trueVal,
                false: falseVal
            } as AST.TernaryOperator;
        }
        return condition;
    }

    parse_type() : AST.Expr
    {
        if (this.at().type == TokenTypes.TokenType.Type)
        {
            this.advance();
            const typeValue = this.parse_comparison();
            return {
                kind: "Type",
                value: typeValue
            } as AST.Type;
        }else{
            return this.parse_comparison();
        }
    }

    parse_comparison() : AST.Expr
    {
        // Get left and right side
        let left = this.parse_addition();
        while ((this.at().type == TokenTypes.TokenType.Comparison))
        {
            const operator = this.advance().value;
            const right = this.parse_addition();

            left = {
                kind: "BooleanExpression",
                left,
                right,
                operator
            } as AST.BooleanExpression
        }

        return left;
    }

    parse_addition() : AST.Expr
    {
        // Get left and right side
        let left = this.parse_multiplication();
        while ((this.at().value == "+" || this.at().value == "-"))
        {
            const operator = this.advance().value;
            const right = this.parse_multiplication();

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator
            } as AST.BinaryExpression
        }

        return left;
    }

    parse_multiplication() : AST.Expr
    {
        // Get left and right side
        let left = this.parse_literal();
        while ((this.at().value == "*" || this.at().value == "/"))
        {
            const operator = this.advance().value;
            const right = this.parse_literal();

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operator
            } as AST.BinaryExpression
        }
        
        return left;
    }

    parse_literal() : AST.Expr {
        const tokenType = this.at().type;
        switch (tokenType)
        {
            case TokenTypes.TokenType.Identifier:
                return {
                    kind: "Identifier",
                    value: this.advance().value
                } as AST.Identifier;
            case TokenTypes.TokenType.Number:
                return {
                    kind: "Number",
                    value: Number(this.advance().value)
                } as AST.Number;
            case TokenTypes.TokenType.OpenParen:
                this.advance();
                const expressionBetween = this.parse_expr();
                const possibleClosingParen = this.advance();
                if (possibleClosingParen.type != TokenTypes.TokenType.ClosedParen)
                {
                    console.log("Expected to find a closing parenthesis");
                    Deno.exit(1);
                }
                return expressionBetween as AST.Expr;
            case TokenTypes.TokenType.String:
                const stringValue = this.advance().value;
                return {
                    kind: "String",
                    value: stringValue.substring(1, stringValue.length-1) // Remove the quotation marks when parsed
                } as AST.String
            case TokenTypes.TokenType.UNKNOWN:
                console.log("An unknown token occured: " + this.at().value);
                Deno.exit(1);
                break;
            default:
                return { kind: "?", value: this.at().value } as AST.Expr
        }
    }
}
