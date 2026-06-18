// Module augmentation for the SDK's ModEventMap. This file imports the SDK so it
// is treated as a module and the `declare module` block *augments* the existing
// types instead of replacing them.
import "@hotbunny/hackhub-content-sdk";

declare module "@hotbunny/hackhub-content-sdk" {
    interface ModEventMap {
        /** Emitted by `mhack` once a target's credentials are cracked. */
        "MillionairHack.MainframeHacked": { host: string; ip: string; user: string };
        /** Emitted by NetInfiltrator when valid credentials reveal a file system. */
        "MillionairHack.SystemBreached": { ip: string; host: string; user: string };
        /** Emitted by NetInfiltrator when J. Lezos' wallet.txt is opened. */
        "MillionairHack.WalletOpened": { ip: string };
        /** Emitted by NetInfiltrator when Zark's secret files are opened. */
        "MillionairHack.ZarkSecretsFound": { ip: string };
        /** Emitted by lcb.com after the player transfers the stolen fortune. */
        "MillionairHack.FundsTransferred": { amount: number };
        /** Emitted by beta.net once the player logs in as Zark. */
        "MillionairHack.ZarkLoggedIn": { user: string };
        /** Emitted by beta.net / GoMail once the player blackmails Zark. */
        "MillionairHack.ZarkBlackmailed": Record<string, never>;
    }
}
