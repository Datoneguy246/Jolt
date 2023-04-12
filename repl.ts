import { toTokens } from "./frontend/lexer/lexer.ts";
import Parser from "./frontend/parser/parser.ts"
import { Emitter } from "./frontend/emitter.ts";
import { Token, TokenType } from "./frontend/lexer/token_types.ts";

console.log("\nJolt REPL v0.1\n© Declan Scott 2023\n")
const emitter = new Emitter();
const parser = new Parser();

// Continue to ask for input until exit
while (true)
{
    const input = prompt(">");
    if (!input)
        continue;

    // Check for exit
    if (input?.trim() == "exit")
    {
        Deno.exit(0);
    }

    // Tokenize
    // const tokens = toTokens(input);
    // tokens.forEach(tkn => {
    //     console.log(tkn.toString());
    // });

    // Parse
    // const ast = parser.Parse(input);
    // console.log(ast);

    // Interpret
    const results = emitter.emitSrc(input);
    results.forEach(result => {
        if ((result as any)[1] != null) {
            if (((result as any)[1] as Token).type == TokenType.Output)
                result = (result as any)[0];
        }


        console.log(result);
    });
}