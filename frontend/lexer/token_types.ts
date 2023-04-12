/*
    All token types
*/

// Token Types
export enum TokenType{
    UNKNOWN,
    EOL,
    EOF,
    Comment,
    // Literals
    Number,
    String,
    Identifier,
    // Operators
    BinaryOperator,
    Equals,
    OpenParen,
    ClosedParen,
    OpenBlock,
    CloseBlock,
    // Ternary Operator
    Ternary_QMARK,
    Ternary_COLON,
    // Comparison
    Comparison,
    // Keywords
    Output,
    Type,
    If
}

// Base
export class Token
{
    value: string;
    type: TokenType;

    constructor(value: string, type: TokenType)
    {
        this.value = value;
        this.type = type;
    }

    // Returns character length of token
    getTokenLength()
    {
        return this.value.length;
    }

    // For Debuging
    toString()
    {
        return TokenType[this.type].toString() + ": " + this.value;
    }
}

// Check for numerical token
export function parseNumericalToken(raw: string, index: number)
{
    let value = "";
    let i = 0;
    while ((!isNaN(Number(raw[index+i])) && raw[index+i] != ' ') || (raw[index+i] == '.' && i > 0))
    {
        value += raw[index+i];
        i++;
    }

    // Check if no numbers were found
    if (i <= 0)
    {
        return null; // Cannot parse to token
    }
    else
    {
        return new Token(value, TokenType.Number); // Can parse to token
    }
}

// Check for string token
export function parseStringToken(raw: string, index: number)
{
    // Check for starting "
    if (raw[index] != '"')
        return null;

    let value = "";
    for (let i = 1; raw[index+i] != '"' && (index+i)-1 < raw.length; i++)
    {
        value += raw[index+i];
    }

    return new Token('"' + value + '"', TokenType.String); // Can parse to token
}


// Check for identifier token
export function parseIdentifierToken(raw: string, index: number)
{
    let value = "";
    let i = 0;
    while (isLetter(raw[index+i]))
    {
        value += raw[index+i];
        i++;
    }

    // Check if no letters were found
    if (i <= 0)
    {
        return null; // Cannot parse to token
    }
    else
    {
        return new Token(value, TokenType.Identifier); // Can parse to token
    }
}

const letterPattern = /^[A-Za-z_]$/; // Letter Regex
function isLetter(char: string): boolean {
    return letterPattern.test(char);
}

const binOpPattern = /[+\-*/]/;
function isBinOp(char: string): boolean {
    return binOpPattern.test(char);
}

// Check for binop token
export function parseBinOpToken(raw: string, index: number)
{
    let value = "";
    if (isBinOp(raw[index]))
    {
        value += raw[index];

        // Check for '='
        if (raw[index+1] == '=')
        {
            // Actually an assignment, not a binOp
            value += raw[index+1];
            return new Token(value, TokenType.Equals);
        }
    }
    else
    {
        return null; // Cannot parse to token
    }

    return new Token(value, TokenType.BinaryOperator); // Can parse to token
}

// Check for equals
export function parseEqualsToken(raw: string, index: number)
{
    if (raw[index] == "=")
    {
        return new Token(raw[index], TokenType.Equals);
    }
    else
    {
        return null;
    }
}

// Check for open/closed paren
export function parseParenToken(raw: string, index: number)
{
    if (raw[index] == "(" || raw[index] == ")")
    {
        const type = raw[index] == "(" ? TokenType.OpenParen : TokenType.ClosedParen; 
        return new Token(raw[index], type);
    }
    else
    {
        return null;
    }
}

// Check for open/closed block
export function parseBlockToken(raw: string, index: number)
{
    if (raw[index] == "{" || raw[index] == "}")
    {
        const type = raw[index] == "{" ? TokenType.OpenBlock : TokenType.CloseBlock; 
        return new Token(raw[index], type);
    }
    else
    {
        return null;
    }
}

// Check for output keyword
export function parseOutputToken(raw: string, index: number)
{
    const substring = raw.substring(index, index+4);
    if (substring == "out ")
    {
        return new Token(substring.substring(0,3), TokenType.Output);
    }
    else
    {
        return null;
    }
}

// Check for EOL (end of line)
export function parseEOLToken(raw: string, index: number)
{
    if (raw[index] == ';')
    {
        return new Token(raw[index], TokenType.EOL);
    }
    else
    {
        return null;
    }
}

// Check for Ternary - ?
export function parseTernaryQMARKToken(raw: string, index: number)
{
    if (raw[index] == '?')
    {
        return new Token(raw[index], TokenType.Ternary_QMARK);
    }
    else
    {
        return null;
    }
}

// Check for Ternary - :
export function parseTernaryCOLONToken(raw: string, index: number)
{
    if (raw[index] == ':')
    {
        return new Token(raw[index], TokenType.Ternary_COLON);
    }
    else
    {
        return null;
    }
}

// Check for comparison
export function parseComparisonToken(raw: string, index: number)
{
    if (raw[index] == '<' || raw[index] == '>')
    {
        return new Token(raw[index], TokenType.Comparison);
    }
    else if (raw[index] == '=' && raw[index+1] == "=")
    {
        return new Token("==", TokenType.Comparison);
    }
    else
    {
        return null;
    }
}

// Check for type keyword
export function parseTypeToken(raw: string, index: number)
{
    const substring = raw.substring(index, index+5);
    if (substring == "type ")
    {
        return new Token(substring.substring(0,4), TokenType.Type);
    }
    else
    {
        return null;
    }
}

// Check for IF keyword
export function parseIfToken(raw: string, index: number)
{
    const substring = raw.substring(index, index+3);
    if (substring == "if ")
    {
        return new Token(substring.substring(0,2), TokenType.If);
    }
    else
    {
        return null;
    }
}

// Check for comment
export function parseCommentToken(raw: string, index: number)
{
    if (raw[index] == '<')
    {
        let value = "<";
        let i = 1;
        let isComment = false;
        while ((index + i) < raw.length)
        {
            value += raw[index+i];

            if (raw[index+i] == ">")
            {
                isComment = true;
                break;
            }
            i++;
        }

        if (isComment)
            return new Token(value, TokenType.Comment);
    }

    return null;
}