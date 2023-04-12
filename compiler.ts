import {
    Emitter
} from "./frontend/emitter.ts";
import { toTokens } from "./frontend/lexer/lexer.ts";
import {
    Token,
    TokenType
} from "./frontend/lexer/token_types.ts";

const filePath = Deno.args[0];
const emitter = new Emitter();
const input = await Deno.readTextFile(filePath);

    // // Tokenize
    // const tokens = toTokens(input);
    // tokens.forEach(tkn => {
    //     console.log(tkn.toString());
    // });

// Interpret
const results = emitter.emitSrc(input);
results.forEach(result => {
    if ((result as any)[1] != null) {
        if (((result as any)[1] as Token).type == TokenType.Output)
            console.log((result as any)[0]);
    }
});