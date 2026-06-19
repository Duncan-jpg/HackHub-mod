import { App, RegisterApp, Events } from "@hotbunny/hackhub-content-sdk";
import appHTML from "./app.html";
import { TARGETS, ARMAZON, BETANET } from "../../data/world";

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
    };
}
