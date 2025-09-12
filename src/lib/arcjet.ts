import "server-only";
import arcjet, {
    fixedWindow,
    detectBot,
    protectSignup,
    sensitiveInfo,
    shield,
    slidingWindow,
} from "@arcjet/next";
import { env } from "./env";

export {
    detectBot,
    fixedWindow,
    protectSignup,
    sensitiveInfo,
    shield,
    slidingWindow,
};
    
    

//==========================================================================
/**
 * where would it make sense to apply request analyzer/(arcjet).?
 * AT api/auth/[.all]/route.ts ,  since all of the betterauth requests funnelld throgh this route handler, this handler since allow user to signin, signup, signout, use session and more as mentioned above.
 * This means we want to request here then analyze it with arcjet then either allow it or deny it.
 * See docs arcjet : https://docs.arcjet.com/integrations/better-auth 
 * THE CODE EXAMPLE FROM ARCJET IS FROM HERE ! https://github.com/arcjet/arcjet-js/blob/main/examples/nextjs-better-auth/app/api/auth/%5B...all%5D/route.ts
 */
//=============================================================================
export default arcjet({
    key: env.ARCJET_KEY, 
    // charactestics -> ["string can be anything"] by default arcjet tracks using IP add, which can be spoofable so this act as a key on which basis arcjet tracks requests, if not provide it uses IP address.
    characteristics: ["fingerprint"],
    rules: [
        //if empty nothing runs as default, or if dont have base rules
        //if provided like exmpl shield, then shield runs everytime we use arcjet
        shield({
            mode: 'LIVE',
        })
    ]
})
