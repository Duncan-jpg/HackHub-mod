// Shared world data for the MillionairHack mod.
//
// Every component (the `mhack` command, the NetInfiltrator app, the quests and
// the in-game websites) reads its target information from here so that the IPs,
// credentials and file systems all stay consistent across the mod.

import type { NetworkFileMap } from "@hotbunny/hackhub-content-sdk";

export interface InfiltrationTarget {
    /** Domain the player types into the browser / `mhack -u`. */
    host: string;
    /** Public IP returned by `whois <host>`. */
    ip: string;
    /** Username recovered by `mhack`. */
    user: string;
    /** Password recovered by `mhack`. */
    password: string;
    /** Human-readable owner, shown by NetInfiltrator. */
    owner: string;
    /** Remote file system shown by NetInfiltrator once breached. */
    fileSystem: NetworkFileMap[];
}

// --- Liberty Central Bank account that the wallet file unlocks -----------------

export const LCB_HOST = "lcb.com";

/** Jeff Lezos' personal bank login, leaked inside wallet.txt. */
export const LEZOS_BANK = {
    host: LCB_HOST,
    username: "j.lezos",
    password: "Liberty$50Bil",
    iban: "LC50ARMAZON0000000050B",
    balance: 50_000_000_000,
};

const WALLET_TXT = [
    "LIBERTY CENTRAL BANK — saved login",
    "------------------------------------",
    `site:     https://${LEZOS_BANK.host}`,
    `username: ${LEZOS_BANK.username}`,
    `password: ${LEZOS_BANK.password}`,
    `iban:     ${LEZOS_BANK.iban}`,
    `balance:  $${LEZOS_BANK.balance.toLocaleString()}`,
    "",
    "do NOT share. - J.L.",
].join("\n");

// --- Zark's leaked beta.net account + blackmail material -----------------------

export const ZARK = {
    host: "beta.net",
    accountUser: "zark@beta.net",
    accountPassword: "iLoveTheMetaverse",
    blackmailEmail: "zark@beta.net",
};

const ZARK_ACCOUNT_TXT = [
    "beta.net — personal account",
    "----------------------------",
    `login: ${ZARK.accountUser}`,
    `pass:  ${ZARK.accountPassword}`,
].join("\n");

const ZARK_SECRETS_TXT = [
    "PRIVATE — do not leak",
    "---------------------",
    "- I'm actually 3 lizards in a hoodie.",
    "- The metaverse legs were CGI the whole time.",
    "- I sold everyone's data twice.",
    "If this gets out I'm finished.",
].join("\n");

// --- Targets -------------------------------------------------------------------

export const ARMAZON: InfiltrationTarget = {
    host: "armazon.org",
    ip: "184.51.33.12",
    user: "jefflezos",
    password: "BezosToTheMoon99",
    owner: "J. Lezos",
    fileSystem: [
        {
            name: "home",
            isFolder: true,
            children: [
                {
                    name: "jefflezos",
                    isFolder: true,
                    children: [
                        { name: "downloads", isFolder: true, children: [] },
                        {
                            name: "desktop",
                            isFolder: true,
                            children: [
                                { name: "wallet", extension: "txt", data: WALLET_TXT },
                            ],
                        },
                        { name: "documents", isFolder: true, children: [] },
                    ],
                },
            ],
        },
        { name: "passwd", isFolder: true, children: [] },
        { name: "user", isFolder: true, children: [] },
    ],
};

export const BETANET: InfiltrationTarget = {
    host: "beta.net",
    ip: "157.240.22.35",
    user: "zarkb",
    password: "M3taverse2004",
    owner: "Z. Buckerzurg",
    fileSystem: [
        {
            name: "home",
            isFolder: true,
            children: [
                {
                    name: "zarkb",
                    isFolder: true,
                    children: [
                        { name: "downloads", isFolder: true, children: [] },
                        {
                            name: "desktop",
                            isFolder: true,
                            children: [
                                { name: "account", extension: "txt", data: ZARK_ACCOUNT_TXT },
                            ],
                        },
                        {
                            name: "documents",
                            isFolder: true,
                            children: [
                                { name: "secrets", extension: "txt", data: ZARK_SECRETS_TXT },
                            ],
                        },
                    ],
                },
            ],
        },
        { name: "passwd", isFolder: true, children: [] },
        { name: "user", isFolder: true, children: [] },
    ],
};

export const TARGETS: InfiltrationTarget[] = [ARMAZON, BETANET];

/** Normalise a URL / host / ip the player typed into a bare host or ip. */
export function normaliseTarget(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");
}

/** Look a target up by host or ip (accepts full urls too). */
export function findTarget(input: string): InfiltrationTarget | undefined {
    const needle = normaliseTarget(input);
    return TARGETS.find((t) => t.host === needle || t.ip === needle);
}
