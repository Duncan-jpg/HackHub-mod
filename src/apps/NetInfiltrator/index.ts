import { App, RegisterApp, Events } from "@hotbunny/hackhub-content-sdk";
import appHTML from "./app.html";
import { TARGETS, ARMAZON, BETANET } from "../../data/world";

interface InfiltrateResult {
    ok: boolean;
    error?: string;
    host?: string;
    owner?: string;
    ip?: string;
    tree?: unknown;
}

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
        /** Validate credentials and return the remote file tree on success. */
        infiltrate: (ip: string, user: string, password: string): InfiltrateResult => {
            const cleanIp = (ip || "").trim();
            const cleanUser = (user || "").trim();
            const cleanPass = (password || "").trim();

            const target = TARGETS.find((t) => t.ip === cleanIp);

            if (!target) {
                return { ok: false, error: `No route to host ${cleanIp || "(empty)"}.` };
            }
            if (target.user !== cleanUser || target.password !== cleanPass) {
                return { ok: false, error: "Authentication failed: bad user or password." };
            }

            Events.emit("MillionairHack.SystemBreached", {
                ip: target.ip,
                host: target.host,
                user: target.user,
            });

            return {
                ok: true,
                host: target.host,
                owner: target.owner,
                ip: target.ip,
                tree: target.fileSystem,
            };
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
    };
}
