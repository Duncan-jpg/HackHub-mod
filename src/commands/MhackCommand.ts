import { Command, RegisterCommand, CommandTools, Events } from "@hotbunny/hackhub-content-sdk";
import { findTarget, normaliseTarget } from "../data/world";

/**
 * `mhack` — the MillionairHack brute-forcer.
 *
 * Installed with `apt-get install mhack`. Point it at a target with
 * `mhack -u <url>` and, if the host is one of the millionaires' servers, it
 * cracks and prints the login you can feed into NetInfiltrator.
 */
@RegisterCommand
export class MhackCommand extends Command {

    CommandName = "mhack";
    Description = "MillionairHack credential cracker — mhack -u <url>";
    PackageName = "mhack";

    Autocomplete = [
        { label: "mhack", type: "STRING" as const },
        { label: "-u", type: "STRING" as const },
        { label: "<url>", type: "DOMAIN" as const },
    ];

    async Run(tools: CommandTools) {
        const { flags } = tools.parseFlags();

        if (flags["help"] || flags["h"]) {
            this.printUsage(tools);
            return;
        }

        const rawUrl = flags["u"] ?? flags["url"];

        if (typeof rawUrl !== "string" || rawUrl.length === 0) {
            tools.printError("Missing target. Usage: mhack -u <url>");
            return;
        }

        const target = findTarget(rawUrl);
        const display = normaliseTarget(rawUrl);

        tools.printInfo(`[mhack] Resolving ${display}...`);
        await tools.sleep(500);

        if (!target) {
            tools.printError(`[mhack] No exploit available for ${display}.`);
            tools.println("Known soft targets: armazon.org, beta.net");
            return;
        }

        tools.println(`[mhack] Target acquired: ${target.host} (${target.ip})`);
        await tools.sleep(400);
        tools.printWarning("[mhack] Brute-forcing mainframe login...");

        for (let i = 1; i <= 3; i++) {
            await tools.sleep(450);
            tools.println(`  attempt ${i}/3 ...`);
        }

        await tools.sleep(350);
        tools.newLine();
        tools.printSuccess("[mhack] Mainframe cracked! Recovered credentials:");
        tools.printTable(
            ["IP", "USER", "PASSWORD"],
            [[target.ip, target.user, target.password]],
        );
        tools.newLine();
        tools.printInfo("Open NetInfiltrator and enter the IP, user and password to browse the file system.");

        Events.emit("MillionairHack.MainframeHacked", {
            host: target.host,
            ip: target.ip,
            user: target.user,
        });
    }

    private printUsage(tools: CommandTools) {
        tools.println("Usage: mhack -u <url>");
        tools.newLine();
        tools.println("Options:");
        tools.println("  -u, --url <url>   Target website to crack (e.g. armazon.org)");
        tools.println("  -h, --help        Show this help message");
    }
}
