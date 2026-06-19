import { App, RegisterApp, Events, Files, Bank, UI } from "@hotbunny/hackhub-content-sdk";
import appHTML from "./app.html";
import { TARGETS, ARMAZON, BETANET, LEZOS_BANK } from "../../data/world";

// Guard so the stolen fortune is only deposited once even if the player
// re-downloads wallet.txt.
let lezosDrained = false;

// Plain, JSON-serialisable copy of the targets so the WebView can validate
// credentials and render the file tree *synchronously* (no async bridge
// round-trip that could hang on "Connecting...").
const TARGET_DATA = TARGETS.map((t) => ({
    host: t.host,
    ip: t.ip,
    user: t.user,
    password: t.password,
    owner: t.owner,
    fileSystem: t.fileSystem,
}));

/**
 * NetInfiltrator — desktop app that browses a remote file system once you feed
 * it a valid IP / user / password (IP comes from `whois`, the credentials come
 * from `mhack`).
 */
@RegisterApp
export class NetInfiltrator extends App {

    AppName = "NetInfiltrator";
    Title = "NetInfiltrator";
    Icon = "";
    HTML = appHTML;

    DefaultSize = { width: 560, height: 520 };
    MinSize = { width: 420, height: 360 };

    Unlocked = true;

    Store = {
        title: "NetInfiltrator",
        ratings: 4.8,
        description: "Connect to a cracked host with an IP, user and password and browse its file system.",
    };

    Exports = {
        /** Synchronous data the WebView uses to validate logins + render trees. */
        targets: TARGET_DATA,

        /** Fire-and-forget: tell the quests a host's file system was breached. */
        reportBreach: (ip: string): void => {
            const cleanIp = (ip || "").trim();
            const target = TARGETS.find((t) => t.ip === cleanIp);
            if (target) {
                Events.emit("MillionairHack.SystemBreached", {
                    ip: target.ip,
                    host: target.host,
                    user: target.user,
                });
            }
        },

        /** Called by the UI when the player opens a file with contents. */
        reportFileOpen: (ip: string, fileName: string): void => {
            const cleanIp = (ip || "").trim();
            const name = (fileName || "").toLowerCase();

            if (cleanIp === ARMAZON.ip && name.startsWith("wallet")) {
                Events.emit("MillionairHack.WalletOpened", { ip: cleanIp });
            }
            if (cleanIp === BETANET.ip && (name.startsWith("secret") || name.startsWith("account"))) {
                Events.emit("MillionairHack.ZarkSecretsFound", { ip: cleanIp });
            }
        },

        /**
         * Download a file from the remote host to the player's own PC. When the
         * downloaded file is J. Lezos' wallet.txt this also drains his $50B into
         * the player's account and completes the Jeff Lezos quest.
         */
        downloadFile: async (
            ip: string,
            name: string,
            extension: string,
            data: string,
        ): Promise<{ ok: boolean; path?: string; error?: string }> => {
            const cleanIp = (ip || "").trim();
            const fullName = extension ? `${name}.${extension}` : name;

            let path: string | undefined;
            try {
                const dir = Files.getDesktopPath();
                await Files.create({
                    name,
                    extension: extension || undefined,
                    data: data || "",
                    parentPath: dir,
                });
                path = `${dir}/${fullName}`;
            } catch (e) {
                return { ok: false, error: "Could not write file to your PC." };
            }

            UI.toast(`Downloaded ${fullName} to your desktop.`, "success");

            const lower = (name || "").toLowerCase();
            if (cleanIp === ARMAZON.ip && lower.startsWith("wallet")) {
                Events.emit("MillionairHack.WalletOpened", { ip: cleanIp });
                Events.emit("MillionairHack.WalletDownloaded", { ip: cleanIp });

                if (!lezosDrained) {
                    lezosDrained = true;
                    const player = Bank.getPlayerAccount();
                    Bank.transaction({
                        amount: LEZOS_BANK.balance,
                        description: "Transfer from J. Lezos (Liberty Central Bank)",
                        from: { IBAN: LEZOS_BANK.iban, name: "Jeff Lezos" },
                        to: player ? player.IBAN : undefined,
                    });
                    Events.emit("MillionairHack.FundsTransferred", { amount: LEZOS_BANK.balance });
                    UI.toast(
                        `$${LEZOS_BANK.balance.toLocaleString()} transferred to your account!`,
                        "success",
                    );
                }
            }
            if (cleanIp === BETANET.ip && (lower.startsWith("secret") || lower.startsWith("account"))) {
                Events.emit("MillionairHack.ZarkSecretsFound", { ip: cleanIp });
            }

            return { ok: true, path };
        },
    };
}
