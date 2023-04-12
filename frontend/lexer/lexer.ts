/*
    The LEXER converts raw source code to a
    series of tokens that can be parsed
*/

import * as TokenTypes from "./token_types.ts";

// Lexer Token Order
type tokenParseFunc = (raw: string, i: number) => void;
const lexerOrder: tokenParseFunc[] = [
    TokenTypes.parseCommentToken,
    TokenTypes.parseStringToken,
    TokenTypes.parseNumericalToken,
    TokenTypes.parseOutputToken,
    TokenTypes.parseTypeToken,
    TokenTypes.parseIfToken,
    TokenTypes.parseTernaryQMARKToken,
    TokenTypes.parseTernaryCOLONToken,
    TokenTypes.parseIdentifierToken,
    TokenTypes.parseBinOpToken,
    TokenTypes.parseComparisonToken,
    TokenTypes.parseEqualsToken,
    TokenTypes.parseParenToken,
    TokenTypes.parseBlockToken,
    TokenTypes.parseEOLToken
]

export function toTokens(raw: string)
{
    // Token Array
    const tokens: TokenTypes.Token[] = [];

    // Iterate through raw code
    let newToken = new TokenTypes.Token(" ", TokenTypes.TokenType.UNKNOWN);

    outerLoop: 
    for (let i = 0; i < raw.length; i += newToken.getTokenLength()) // After parsing add the length of the token to i
    {
        // Omit Whitespace and newlines
        if (raw[i] == " " || raw[i] == '\n')
        {
            newToken = new TokenTypes.Token(raw[i], TokenTypes.TokenType.UNKNOWN);
            continue;
        }

        // Check for each token type
        for (let j = 0; j < lexerOrder.length; j++)
        {
            newToken = lexerOrder[j](raw,i) as unknown as TokenTypes.Token;
            if (newToken != null)
            {
                tokens.push(newToken)
                continue outerLoop;
            }
        }
            
        // Unknown Token
        newToken = new TokenTypes.Token(raw[i], TokenTypes.TokenType.UNKNOWN);  
        tokens.push(newToken);
    }

    // Add EOF token
    tokens.push(new TokenTypes.Token("EOF", TokenTypes.TokenType.EOF));

    return tokens;
}

// EX. out (2 + 3)
// EX. route = 2 * (3 + 41)