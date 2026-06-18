import { Website, RegisterWebsite, WebsitePageDefinition, Bank, Events, UI } from "@hotbunny/hackhub-content-sdk";
import homePage from "./pages/home.html";
import { LEZOS_BANK } from "../../data/world";

interface LoginResult {
    ok: boolean;
    iban?: string;
    balance?: number;
    owner?: string;
}

interface TransferResult {
    ok: boolean;
    error?: string;
    amount?: number;
    toIban?: string;
}

/**
 * lcb.com — Liberty Central Bank. Supporting website for the Jeff Lezos quest:
 * the wallet.txt found via NetInfiltrator unlocks J. Lezos' login here, and the
 * player drains his $50B into their own account.
 */
@RegisterWebsite
export class LibertyCentralBank extends Website {

    SiteName = "Liberty Central Bank";
    Host = "lcb.com";
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Liberty Central Bank — Online Banking",
            description: "Liberty Central Bank online banking portal.",
            html: homePage,
            seo: true,
            search: ["lcb", "bank", "liberty", "banking"],
        },
    ];

    Exports = {
        /** Validate the stolen wallet credentials. */
        bankLogin: (user: string, password: string): LoginResult => {
            const u = (user || "").trim().toLowerCase();
            const p = (password || "").trim();
            if (u === LEZOS_BANK.username.toLowerCase() && p === LEZOS_BANK.password) {
                return {
                    ok: true,
                    iban: LEZOS_BANK.iban,
                    balance: LEZOS_BANK.balance,
                    owner: "Jeff Lezos",
                };
            }
            return { ok: false };
        },

        /** Drain J. Lezos' balance into the player's own account. */
        transferToMyAccount: (): TransferResult => {
            const player = Bank.getPlayerAccount();
            if (!player || !player.IBAN) {
                return { ok: false, error: "Could not resolve your bank account." };
            }
            const amount = LEZOS_BANK.balance;
            Bank.transaction({
                amount,
                description: "Transfer from J. Lezos (Liberty Central Bank)",
                from: { IBAN: LEZOS_BANK.iban, name: "Jeff Lezos" },
                to: player.IBAN,
            });
            UI.toast("$" + amount.toLocaleString() + " transferred to your account!", "success");
            Events.emit("MillionairHack.FundsTransferred", { amount });
            return { ok: true, amount, toIban: player.IBAN };
        },

        formatMoney: (n: number) => "$" + n.toLocaleString(),
    };
}
