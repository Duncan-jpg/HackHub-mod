import { Website, RegisterWebsite, WebsitePageDefinition, Bank, Events, UI } from "@hotbunny/hackhub-content-sdk";
import homePage from "./pages/home.html";
import { LEZOS_BANK } from "../../data/world";

// Guard so the stolen fortune is only moved once.
let lezosDrained = false;

// Plain, serialisable account data so the WebView can validate the login
// synchronously (no async bridge round-trip that could hang).
const LEZOS_ACCOUNT = {
    username: LEZOS_BANK.username,
    password: LEZOS_BANK.password,
    iban: LEZOS_BANK.iban,
    owner: "Jeff Lezos",
    balance: LEZOS_BANK.balance,
};



interface TransferResult {
    ok: boolean;
    error?: string;
    amount?: number;
    toIban?: string;
}

/**
 * sbs.com — Secure Banking Skills. A third-party banking portal: log in with a
 * Liberty Central Bank account's username + password + IBAN, then move its
 * balance to your own real lcb.com account. The Jeff Lezos quest uses this to
 * drain his $50B (since the built-in lcb.com can't host an NPC account).
 */
@RegisterWebsite
export class SecureBankingSkills extends Website {

    SiteName = "Secure Banking Skills";
    Host = "sbs.com";
    Icon = "";

    Popular = true;

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Secure Banking Skills — remote banking portal",
            description: "Secure Banking Skills (SBS) — access any Liberty Central Bank account and move funds.",
            html: homePage,
            seo: true,
            search: ["sbs", "bank", "banking", "secure", "transfer", "lcb"],
        },
    ];

    Exports = {
        /** Synchronous account data the WebView uses to validate the login. */
        account: LEZOS_ACCOUNT,

        /**
         * Deposit the logged-in account's balance into the destination IBAN.
         * Used by the deposit tab once the player enters their own IBAN.
         */
        depositToIban: (destIban: string): TransferResult => {
            const player = Bank.getPlayerAccount();
            if (!player || !player.IBAN) {
                return { ok: false, error: "Could not resolve your bank account." };
            }
            const dest = (destIban || "").trim();
            if (!dest) {
                return { ok: false, error: "Enter your IBAN to deposit." };
            }
            const amount = LEZOS_BANK.balance;
            if (!lezosDrained) {
                lezosDrained = true;
                Bank.transaction({
                    amount,
                    description: "Transfer from J. Lezos (Liberty Central Bank)",
                    from: { IBAN: LEZOS_BANK.iban, name: "Jeff Lezos" },
                    to: player.IBAN,
                });
                Events.emit("MillionairHack.FundsTransferred", { amount });
                UI.toast("$" + amount.toLocaleString() + " deposited to your lcb.com account!", "success");
            }
            return { ok: true, amount, toIban: player.IBAN };
        },
    };
}
